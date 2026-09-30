package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class AppPropertiesTests {

    private static final String[] REQUIRED = {
            "app.frontend-url=https://example.test",
            "app.security.secret=c2VjcmV0LXZhbHVl",
            "app.mail.from=no-reply@example.test"};

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(Bindings.class)
            .withPropertyValues(REQUIRED);

    @Test
    void appliesDefaultsToEveryOptionalSetting() {
        runner.run(context -> {
            var properties = context.getBean(AppProperties.class);
            assertThat(properties.frontendUrl()).isEqualTo(URI.create("https://example.test"));
            assertThat(properties.cors().allowedOrigins()).containsExactly("http://localhost:5173");
            assertThat(properties.security()).isEqualTo(new AppProperties.Security("c2VjcmV0LXZhbHVl", "portfolio",
                    "portfolio-api", Duration.ofMinutes(15), Duration.ofDays(30), Duration.ofHours(24),
                    Duration.ofHours(1), 5, Duration.ofMinutes(15), Duration.ofMinutes(2), 30, ""));
            assertThat(properties.mail()).isEqualTo(new AppProperties.Mail("no-reply@example.test", "Portfolio", 25, 8,
                    5, Duration.ofSeconds(30), Duration.ofHours(1), Duration.ofMinutes(15)));
            assertThat(properties.seed().enabled()).isFalse();
            assertThat(properties.seed().users().getFilename()).isEqualTo("users.json");
            assertThat(properties.seed().users().exists()).isTrue();
        });
    }

    @Test
    void bindsExplicitSettings() {
        runner.withPropertyValues(
                        "app.cors.allowed-origins=https://a.example.test,https://b.example.test",
                        "app.security.access-token-ttl=5m",
                        "app.security.max-failed-logins=3",
                        "app.security.email-cooldown=5m",
                        "app.security.auth-requests-per-minute=60",
                        "app.security.scrape-password=Scrape-Passw0rd",
                        "app.mail.batch-size=50",
                        "app.mail.initial-backoff=PT10S",
                        "app.seed.enabled=true")
                .run(context -> {
                    var properties = context.getBean(AppProperties.class);
                    assertThat(properties.cors().allowedOrigins())
                            .containsExactly("https://a.example.test", "https://b.example.test");
                    assertThat(properties.security().accessTokenTtl()).isEqualTo(Duration.ofMinutes(5));
                    assertThat(properties.security().maxFailedLogins()).isEqualTo(3);
                    assertThat(properties.security().emailCooldown()).isEqualTo(Duration.ofMinutes(5));
                    assertThat(properties.security().authRequestsPerMinute()).isEqualTo(60);
                    assertThat(properties.security().scrapePassword()).isEqualTo("Scrape-Passw0rd");
                    assertThat(properties.mail().batchSize()).isEqualTo(50);
                    assertThat(properties.mail().initialBackoff()).isEqualTo(Duration.ofSeconds(10));
                    assertThat(properties.seed().enabled()).isTrue();
                });
    }

    @ParameterizedTest(name = "{0}")
    @CsvSource(delimiter = '|', textBlock = """
            app.security.secret=               | security.secret
            app.mail.from=not-an-email         | mail.from
            app.mail.from=                     | mail.from
            app.security.max-failed-logins=0   | security.maxFailedLogins
            app.security.auth-requests-per-minute=0 | security.authRequestsPerMinute
            app.mail.batch-size=0              | mail.batchSize
            app.mail.concurrency=0             | mail.concurrency
            app.mail.max-attempts=0            | mail.maxAttempts
            """)
    void refusesToStartWithInvalidSettings(String property, String field) {
        runner.withPropertyValues(property).run(context -> assertThat(context)
                .hasFailed()
                .getFailure()
                .rootCause()
                .hasMessageContaining("on field '" + field + "'"));
    }

    @Test
    void refusesToStartWithoutItsFrontendUrl() {
        new ApplicationContextRunner()
                .withUserConfiguration(Bindings.class)
                .withPropertyValues("app.security.secret=c2VjcmV0LXZhbHVl", "app.mail.from=no-reply@example.test")
                .run(context -> assertThat(context)
                        .hasFailed()
                        .getFailure()
                        .rootCause()
                        .hasMessageContaining("on field 'frontendUrl'"));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(AppProperties.class)
    static class Bindings {}
}
