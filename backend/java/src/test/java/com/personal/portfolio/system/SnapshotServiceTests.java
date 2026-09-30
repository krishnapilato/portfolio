package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.personal.portfolio.mail.MailRepository;
import com.personal.portfolio.mail.MailStatus;
import com.personal.portfolio.platform.Tally;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.UserRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.boot.health.actuate.endpoint.CompositeHealthDescriptor;
import org.springframework.boot.health.actuate.endpoint.HealthDescriptor;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.health.actuate.endpoint.IndicatedHealthDescriptor;
import org.springframework.boot.health.contributor.Status;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.micrometer.metrics.actuate.endpoint.MetricsEndpoint;
import org.springframework.dao.DataAccessResourceFailureException;

class SnapshotServiceTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:30:00Z");

    private final MeterRegistry registry = new SimpleMeterRegistry();
    private final HealthEndpoint health = mock(HealthEndpoint.class);
    private final UserRepository users = mock(UserRepository.class);
    private final MailRepository mail = mock(MailRepository.class);
    private final Clock clock = mock(Clock.class);
    private final AtomicReference<Instant> now = new AtomicReference<>(NOW);

    @BeforeEach
    void stubRepositories() {
        given(clock.instant()).willAnswer(_ -> now.get());
        given(users.tallyByStatus()).willReturn(List.of(
                new Tally<>(AccountStatus.ACTIVE, 3L), new Tally<>(AccountStatus.PENDING, 2L),
                new Tally<>(AccountStatus.LOCKED, 1L)));
        given(mail.tallyByStatus()).willReturn(List.of(
                new Tally<>(MailStatus.SENT, 7L), new Tally<>(MailStatus.FAILED, 1L)));
        var healthy = descriptor(IndicatedHealthDescriptor.class, Status.UP);
        given(health.health()).willReturn(healthy);
    }

    @Test
    void summarisesRuntimeTrafficAndDomainFromTheActuator() {
        gauge("process.uptime", 3_723.9, Tags.empty());
        gauge("jvm.memory.used", 100, Tags.of("area", "heap", "id", "eden"));
        gauge("jvm.memory.used", 50, Tags.of("area", "heap", "id", "old"));
        gauge("jvm.memory.used", 999, Tags.of("area", "nonheap", "id", "metaspace"));
        gauge("jvm.memory.max", 512, Tags.of("area", "heap", "id", "old"));
        gauge("jvm.threads.live", 42, Tags.empty());
        gauge("process.cpu.usage", 0.25, Tags.empty());
        var ok = Timer.builder("http.server.requests").tag("outcome", "SUCCESS").register(registry);
        var failed = Timer.builder("http.server.requests").tag("outcome", "SERVER_ERROR").register(registry);
        ok.record(Duration.ofMillis(10));
        ok.record(Duration.ofMillis(10));
        ok.record(Duration.ofMillis(10));
        failed.record(Duration.ofMillis(50));

        var snapshot = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture();

        assertThat(snapshot.capturedAt()).isEqualTo(NOW);
        assertThat(snapshot.runtime()).satisfies(runtime -> {
            assertThat(runtime.java()).isEqualTo(Runtime.version().toString());
            assertThat(runtime.vendor()).isEqualTo(System.getProperty("java.vendor"));
            assertThat(runtime.uptimeSeconds()).isEqualTo(3_723);
            assertThat(runtime.heapUsed()).isEqualTo(150);
            assertThat(runtime.heapMax()).isEqualTo(512);
            assertThat(runtime.threads()).isEqualTo(42);
            assertThat(runtime.cpu()).isEqualTo(0.25);
            assertThat(runtime.processors()).isEqualTo(Runtime.getRuntime().availableProcessors());
        });
        assertThat(snapshot.traffic()).satisfies(traffic -> {
            assertThat(traffic.requests()).isEqualTo(4);
            assertThat(traffic.serverErrors()).isEqualTo(1);
            assertThat(traffic.meanLatencyMs()).isCloseTo(20.0, within(1e-9));
        });
        assertThat(snapshot.domain()).isEqualTo(new SystemSnapshot.Domain(6, 3, 0, 7, 1));
    }

    @Test
    void keepsLongLivedPulseStreamsOutOfTheMeanLatency() {
        var api = Timer.builder("http.server.requests").tags("uri", "/api/v1/me", "outcome", "SUCCESS")
                .register(registry);
        var pulse = Timer.builder("http.server.requests").tags("uri", "/system/pulse", "outcome", "SUCCESS")
                .register(registry);
        api.record(Duration.ofMillis(10));
        api.record(Duration.ofMillis(10));
        pulse.record(Duration.ofSeconds(60));

        var traffic = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture().traffic();

        assertThat(traffic.requests()).isEqualTo(3);
        assertThat(traffic.meanLatencyMs()).isCloseTo(10.0, within(1e-9));
    }

    @Test
    void reportsNoLatencyWhenOnlyPulseStreamsWereServed() {
        Timer.builder("http.server.requests").tags("uri", "/system/pulse", "outcome", "SUCCESS").register(registry)
                .record(Duration.ofSeconds(30));

        var traffic = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture().traffic();

        assertThat(traffic.requests()).isEqualTo(1);
        assertThat(traffic.meanLatencyMs()).isZero();
    }

    @Test
    void reportsZeroForMetricsThatAreMissingOrNotFinite() {
        gauge("process.cpu.usage", Double.NaN, Tags.empty());

        var snapshot = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture();

        assertThat(snapshot.runtime()).satisfies(runtime -> {
            assertThat(runtime.uptimeSeconds()).isZero();
            assertThat(runtime.heapUsed()).isZero();
            assertThat(runtime.heapMax()).isZero();
            assertThat(runtime.threads()).isZero();
            assertThat(runtime.cpu()).isZero();
        });
        assertThat(snapshot.traffic()).isEqualTo(new SystemSnapshot.Traffic(0, 0, 0));
    }

    @Test
    void listsTheStatusOfEveryHealthComponentInNameOrder() {
        var composite = descriptor(CompositeHealthDescriptor.class, Status.DOWN);
        Map<String, HealthDescriptor> components = Map.of(
                "ping", descriptor(IndicatedHealthDescriptor.class, Status.UP),
                "db", descriptor(IndicatedHealthDescriptor.class, Status.DOWN),
                "diskSpace", descriptor(IndicatedHealthDescriptor.class, Status.OUT_OF_SERVICE));
        given(composite.getComponents()).willReturn(components);
        given(health.health()).willReturn(composite);

        var snapshot = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture();

        assertThat(snapshot.status()).isEqualTo("DOWN");
        assertThat(snapshot.components()).containsExactly(
                Map.entry("db", "DOWN"), Map.entry("diskSpace", "OUT_OF_SERVICE"), Map.entry("ping", "UP"));
    }

    @Test
    void reportsNoComponentsForASingleHealthIndicator() {
        var snapshot = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture();

        assertThat(snapshot.status()).isEqualTo("UP");
        assertThat(snapshot.components()).isEmpty();
    }

    @Test
    void describesTheBuildFromBuildAndGitInformation() {
        var build = new Properties();
        build.setProperty("version", "1.4.2");
        build.setProperty("time", "2026-09-29T20:15:00Z");
        var git = new Properties();
        git.setProperty("commit.id", "0123456789abcdef0123456789abcdef01234567");
        git.setProperty("commit.id.abbrev", "0123456");

        var snapshot = service(
                new StaticListableBeanFactory(Map.of("build", new BuildProperties(build))),
                new StaticListableBeanFactory(Map.of("git", new GitProperties(git)))).capture();

        assertThat(snapshot.build())
                .isEqualTo(new SystemSnapshot.Build("1.4.2", "0123456", Instant.parse("2026-09-29T20:15:00Z")));
    }

    @Test
    void fallsBackToADevelopmentBuildWithoutBuildInformation() {
        var snapshot = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture();

        assertThat(snapshot.build()).isEqualTo(new SystemSnapshot.Build("dev", null, null));
    }

    @Test
    void servesTheSameSnapshotUntilItIsTwoSecondsOld() {
        var service = service(new StaticListableBeanFactory(), new StaticListableBeanFactory());

        var first = service.current();
        now.set(NOW.plusMillis(1_999));

        assertThat(service.current()).isSameAs(first);
        verify(health, times(1)).health();
        verify(users, times(1)).tallyByStatus();

        now.set(NOW.plusSeconds(2));
        var second = service.current();

        assertThat(second).isNotSameAs(first);
        assertThat(second.capturedAt()).isEqualTo(NOW.plusSeconds(2));
        verify(health, times(2)).health();
        verify(users, times(2)).tallyByStatus();
    }

    @Test
    void keepsTheLastKnownFiguresWhileTheDatabaseIsUnreachable() {
        var service = service(new StaticListableBeanFactory(), new StaticListableBeanFactory());
        var known = service.capture().domain();
        var down = descriptor(CompositeHealthDescriptor.class, Status.DOWN);
        Map<String, HealthDescriptor> components = Map.of("db", descriptor(IndicatedHealthDescriptor.class, Status.DOWN));
        given(down.getComponents()).willReturn(components);
        given(health.health()).willReturn(down);
        given(users.tallyByStatus()).willThrow(new DataAccessResourceFailureException("Connection is not available"));

        var degraded = service.capture();

        assertThat(degraded.status()).isEqualTo("DOWN");
        assertThat(degraded.components()).containsEntry("db", "DOWN");
        assertThat(degraded.domain()).isEqualTo(known).isEqualTo(new SystemSnapshot.Domain(6, 3, 0, 7, 1));
    }

    @Test
    void reportsZeroFiguresWhenTheDatabaseWasNeverReachable() {
        given(mail.tallyByStatus()).willThrow(new DataAccessResourceFailureException("Connection refused"));

        var snapshot = service(new StaticListableBeanFactory(), new StaticListableBeanFactory()).capture();

        assertThat(snapshot.domain()).isEqualTo(new SystemSnapshot.Domain(0, 0, 0, 0, 0));
    }

    @Test
    void keepsComponentsSortedAndImmutable() {
        var snapshot = new SystemSnapshot(NOW, "UP", Map.of("ssl", "UP", "db", "UP", "mailOutbox", "UP"),
                new SystemSnapshot.Jvm("27", "vendor", 0, 0, 0, 0, 0, 1), new SystemSnapshot.Traffic(0, 0, 0),
                new SystemSnapshot.Domain(0, 0, 0, 0, 0), new SystemSnapshot.Build("dev", null, null));

        assertThat(snapshot.components().keySet()).containsExactly("db", "mailOutbox", "ssl");
        assertThat(snapshot.components()).isUnmodifiable();
    }

    private SnapshotService service(StaticListableBeanFactory buildInfo, StaticListableBeanFactory gitInfo) {
        return new SnapshotService(health, new MetricsEndpoint(registry), users, mail,
                buildInfo.getBeanProvider(BuildProperties.class), gitInfo.getBeanProvider(GitProperties.class),
                clock);
    }

    private void gauge(String name, double value, Tags tags) {
        Gauge.builder(name, () -> value).tags(tags).register(registry);
    }

    private static <T extends HealthDescriptor> T descriptor(Class<T> type, Status status) {
        var descriptor = mock(type);
        given(descriptor.getStatus()).willReturn(status);
        return descriptor;
    }
}
