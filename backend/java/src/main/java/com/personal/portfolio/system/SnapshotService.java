package com.personal.portfolio.system;

import com.personal.portfolio.mail.MailRepository;
import com.personal.portfolio.mail.MailStatus;
import com.personal.portfolio.platform.Tally;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.UserRepository;
import io.micrometer.core.instrument.Statistic;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.health.actuate.endpoint.CompositeHealthDescriptor;
import org.springframework.boot.health.actuate.endpoint.HealthDescriptor;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.health.actuate.endpoint.IndicatedHealthDescriptor;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.micrometer.metrics.actuate.endpoint.MetricsEndpoint;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
class SnapshotService {

    private static final String HTTP_REQUESTS = "http.server.requests";
    private static final String HEAP = "area:heap";
    private static final String SERVER_ERROR = "outcome:SERVER_ERROR";
    private static final String PULSE_STREAM = "uri:/system/pulse";
    private static final Duration FRESHNESS = Duration.ofSeconds(2);

    private final HealthEndpoint health;
    private final MetricsEndpoint metrics;
    private final UserRepository users;
    private final MailRepository mail;
    private final Clock clock;
    private final SystemSnapshot.Build build;
    private volatile SystemSnapshot.Domain lastDomain = new SystemSnapshot.Domain(0, 0, 0, 0, 0);
    private @Nullable SystemSnapshot latest;

    SnapshotService(
            HealthEndpoint health,
            MetricsEndpoint metrics,
            UserRepository users,
            MailRepository mail,
            ObjectProvider<BuildProperties> buildInfo,
            ObjectProvider<GitProperties> gitInfo,
            Clock clock) {
        this.health = health;
        this.metrics = metrics;
        this.users = users;
        this.mail = mail;
        this.clock = clock;
        var buildProperties = Optional.ofNullable(buildInfo.getIfAvailable());
        this.build = new SystemSnapshot.Build(
                buildProperties.map(BuildProperties::getVersion).orElse("dev"),
                Optional.ofNullable(gitInfo.getIfAvailable()).map(GitProperties::getShortCommitId).orElse(null),
                buildProperties.map(BuildProperties::getTime).orElse(null));
    }

    public synchronized SystemSnapshot current() {
        var cached = latest;
        if (cached == null || !clock.instant().isBefore(cached.capturedAt().plus(FRESHNESS))) {
            cached = capture();
            latest = cached;
        }
        return cached;
    }

    public SystemSnapshot capture() {
        var descriptor = health.health();
        return new SystemSnapshot(
                clock.instant(),
                descriptor.getStatus().getCode(),
                components(descriptor),
                runtime(),
                traffic(),
                domain(),
                build);
    }

    private static Map<String, String> components(HealthDescriptor descriptor) {
        return switch (descriptor) {
            case CompositeHealthDescriptor composite -> composite.getComponents().entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().getStatus().getCode()));
            case IndicatedHealthDescriptor _ -> Map.of();
        };
    }

    private SystemSnapshot.Jvm runtime() {
        return new SystemSnapshot.Jvm(
                Runtime.version().toString(),
                System.getProperty("java.vendor", "unknown"),
                (long) gauge("process.uptime"),
                (long) gauge("jvm.memory.used", HEAP),
                (long) gauge("jvm.memory.max", HEAP),
                (int) gauge("jvm.threads.live"),
                gauge("process.cpu.usage"),
                Runtime.getRuntime().availableProcessors());
    }

    private SystemSnapshot.Traffic traffic() {
        var requests = (long) measure(HTTP_REQUESTS, Statistic.COUNT);
        var handled = requests - (long) measure(HTTP_REQUESTS, Statistic.COUNT, PULSE_STREAM);
        var handledSeconds = measure(HTTP_REQUESTS, Statistic.TOTAL_TIME)
                - measure(HTTP_REQUESTS, Statistic.TOTAL_TIME, PULSE_STREAM);
        return new SystemSnapshot.Traffic(
                requests,
                (long) measure(HTTP_REQUESTS, Statistic.COUNT, SERVER_ERROR),
                handledSeconds * 1_000 / Math.max(handled, 1));
    }

    private SystemSnapshot.Domain domain() {
        try {
            var accounts = Tally.zeroFilled(AccountStatus.class, users.tallyByStatus());
            var outbox = Tally.zeroFilled(MailStatus.class, mail.tallyByStatus());
            lastDomain = new SystemSnapshot.Domain(
                    accounts.values().stream().mapToLong(Long::longValue).sum(),
                    accounts.get(AccountStatus.ACTIVE),
                    outbox.get(MailStatus.PENDING),
                    outbox.get(MailStatus.SENT),
                    outbox.get(MailStatus.FAILED));
        } catch (DataAccessException e) {
            log.warn("Dashboard figures are unavailable, showing the last known ones: {}", e.getMessage());
        }
        return lastDomain;
    }

    private double gauge(String name, String... tags) {
        return measure(name, Statistic.VALUE, tags);
    }

    private double measure(String name, Statistic statistic, String... tags) {
        var metric = metrics.metric(name, List.of(tags));
        return metric == null ? 0 : metric.getMeasurements().stream()
                .filter(sample -> sample.getStatistic() == statistic)
                .mapToDouble(MetricsEndpoint.Sample::getValue)
                .filter(Double::isFinite)
                .findFirst()
                .orElse(0);
    }
}
