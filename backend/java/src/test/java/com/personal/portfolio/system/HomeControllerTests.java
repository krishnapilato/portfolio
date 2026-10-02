package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Properties;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.boot.SpringBootVersion;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.health.actuate.endpoint.IndicatedHealthDescriptor;
import org.springframework.boot.health.contributor.Status;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.ui.ExtendedModelMap;

class HomeControllerTests {

    private final HealthEndpoint health = mock(HealthEndpoint.class);
    private final MovableClock clock = new MovableClock(Instant.parse("2026-10-01T08:00:00Z"));

    @Test
    void checksHealthAtMostOncePerCachePeriod() {
        var up = descriptor(Status.UP);
        var down = descriptor(Status.DOWN);
        given(health.health()).willReturn(up, down);
        var controller = controller(null, null);

        assertThat(render(controller)).containsEntry("status", "UP");
        clock.advance(Duration.ofSeconds(9));
        assertThat(render(controller)).containsEntry("status", "UP");
        clock.advance(Duration.ofSeconds(1));
        assertThat(render(controller)).containsEntry("status", "DOWN");
        then(health).should(times(2)).health();
    }

    @Test
    void showsTheVersionCommitAndBuildDate() {
        var build = new Properties();
        build.setProperty("version", "2.3.4");
        build.setProperty("time", "2026-09-30T22:15:00Z");
        var git = new Properties();
        git.setProperty("commit.id", "10bbaa5f0e1d2c3b4a59687");
        stubHealth(Status.UP);

        assertThat(render(controller(new BuildProperties(build), new GitProperties(git))))
                .containsEntry("version", "2.3.4")
                .containsEntry("commit", "10bbaa5")
                .containsEntry("built", "30 Sep 2026");
    }

    @Test
    void fallsBackWhenTheBuildLeftNoInformation() {
        stubHealth(Status.UP);

        assertThat(render(controller(null, null)))
                .containsEntry("version", "dev")
                .containsEntry("commit", null)
                .containsEntry("built", null)
                .containsEntry("runtime",
                        "Java " + Runtime.version().feature() + " · Spring Boot " + SpringBootVersion.getVersion());
    }

    @Test
    void measuresUptimeFromStartup() {
        stubHealth(Status.UP);
        var controller = controller(null, null);

        clock.advance(Duration.ofMinutes(90));

        assertThat(render(controller)).containsEntry("uptime", "1 h 30 min");
    }

    @ParameterizedTest
    @CsvSource({
            "PT0S, 1 min",
            "PT1M59S, 1 min",
            "PT59M59S, 59 min",
            "PT1H, 1 h 0 min",
            "PT23H59M, 23 h 59 min",
            "P1D, 1 d 0 h",
            "P2DT5H30M, 2 d 5 h"})
    void formatsUptimeForPeople(Duration uptime, String expected) {
        assertThat(HomeController.uptime(uptime)).isEqualTo(expected);
    }

    private HomeController controller(@Nullable BuildProperties build, @Nullable GitProperties git) {
        var beans = new StaticListableBeanFactory();
        if (build != null) {
            beans.addBean("build", build);
        }
        if (git != null) {
            beans.addBean("git", git);
        }
        return new HomeController(health, beans.getBeanProvider(BuildProperties.class),
                beans.getBeanProvider(GitProperties.class), clock);
    }

    private static Map<String, Object> render(HomeController controller) {
        var model = new ExtendedModelMap();
        assertThat(controller.home(model)).isEqualTo("home");
        return model;
    }

    private void stubHealth(Status status) {
        var descriptor = descriptor(status);
        given(health.health()).willReturn(descriptor);
    }

    private static IndicatedHealthDescriptor descriptor(Status status) {
        var descriptor = mock(IndicatedHealthDescriptor.class);
        given(descriptor.getStatus()).willReturn(status);
        return descriptor;
    }

    private static final class MovableClock extends Clock {

        private Instant now;

        MovableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }
}
