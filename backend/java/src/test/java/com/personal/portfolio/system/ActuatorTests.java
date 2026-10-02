package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import java.util.Locale;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class ActuatorTests extends IntegrationTest {

    @Test
    void publishesOnlyTheOverallHealthToAnonymousVisitors() {
        assertThat(mvc.get().uri("/actuator/health"))
                .hasStatusOk()
                .bodyJson()
                .isLenientlyEqualTo("""
                        {"status": "UP"}
                        """)
                .doesNotHavePath("$.components");
    }

    @Test
    void revealsHealthDetailsToAdministrators() {
        assertThat(mvc.get().uri("/actuator/health").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPath("$.components.db.details.database")
                .hasPath("$.components.mailOutbox.details.pending")
                .hasPath("$.components.diskSpace.details.free");
    }

    @Test
    void keepsHealthComponentsFromOrdinaryUsers() {
        assertThat(mvc.get().uri("/actuator/health").with(user(1)))
                .hasStatusOk()
                .bodyJson()
                .doesNotHavePath("$.components");
    }

    @ParameterizedTest
    @ValueSource(strings = {"liveness", "readiness"})
    void exposesKubernetesProbes(String probe) {
        assertThat(mvc.get().uri("/actuator/health/{probe}", probe))
                .hasStatusOk()
                .bodyJson()
                .isLenientlyEqualTo("""
                        {"status": "UP"}
                        """);
    }

    @Test
    void checksTheDatabaseForReadiness() {
        assertThat(mvc.get().uri("/actuator/health/readiness").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPath("$.components.readinessState")
                .hasPath("$.components.db")
                .doesNotHavePath("$.components.mailOutbox");
    }

    @Test
    void describesTheApplicationPublicly() {
        assertThat(mvc.get().uri("/actuator/info"))
                .hasStatusOk()
                .bodyJson()
                .isLenientlyEqualTo("""
                        {
                          "app": {"name": "Portfolio Platform"},
                          "build": {"artifact": "portfolio", "group": "com.personal"}
                        }
                        """)
                .hasPath("$.app.description")
                .hasPath("$.build.version")
                .hasPath("$.build.time")
                .doesNotHavePath("$.java")
                .doesNotHavePath("$.os")
                .doesNotHavePath("$.process");
    }

    @Test
    void listsTheEndpointLinksToAdministratorsOnly() {
        assertThat(mvc.get().uri("/actuator")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/actuator").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPath("$._links.self.href")
                .hasPath("$._links.health.href")
                .hasPath("$._links.info.href")
                .hasPath("$._links.metrics.href")
                .hasPath("$._links.auditevents.href")
                .hasPath("$._links.httpexchanges.href")
                .hasPath("$._links.outbox.href");
    }

    @ParameterizedTest
    @ValueSource(strings = {"/actuator/metrics", "/actuator/env", "/actuator/beans", "/actuator/configprops",
            "/actuator/loggers", "/actuator/mappings", "/actuator/scheduledtasks", "/actuator/conditions",
            "/actuator/flyway", "/actuator/auditevents", "/actuator/httpexchanges", "/actuator/threaddump"})
    void restrictsOperationalEndpointsToAdministrators(String endpoint) {
        assertThat(mvc.get().uri(endpoint)).hasStatus(HttpStatus.UNAUTHORIZED).containsHeader("WWW-Authenticate");
        assertThat(mvc.get().uri(endpoint).with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.get().uri(endpoint).with(admin()).accept(MediaType.APPLICATION_JSON)).hasStatusOk();
    }

    @Test
    void listsApplicationMetricsToAdministrators() {
        assertThat(mvc.get().uri("/actuator/metrics").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPathSatisfying("$.names", names -> assertThat(names).asArray().contains(
                        "jvm.memory.used", "http.server.requests", "portfolio.mail.dispatched"));
        assertThat(mvc.get().uri("/actuator/metrics/jvm.memory.used").param("tag", "area:heap").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .isLenientlyEqualTo("""
                        {"name": "jvm.memory.used", "baseUnit": "bytes"}
                        """);
    }

    @Test
    void recordsFailedSignInsAsAuditEvents() {
        var email = "audit-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT) + "@nowhere.test";

        assertThat(mvc.post().uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s", "password": "Wrong-Passw0rd"}
                        """.formatted(email)))
                .hasStatus(HttpStatus.UNAUTHORIZED);

        assertThat(mvc.get().uri("/actuator/auditevents").param("principal", email).with(admin()))
                .hasStatusOk()
                .bodyJson()
                .isLenientlyEqualTo("""
                        {
                          "events": [
                            {
                              "principal": "%s",
                              "type": "AUTHENTICATION_FAILURE",
                              "data": {"reason": "unknown-account"}
                            }
                          ]
                        }
                        """.formatted(email))
                .hasPathSatisfying("$.events", events -> assertThat(events).asArray().hasSize(1))
                .hasPath("$.events[0].data.requestId")
                .hasPath("$.events[0].timestamp");
    }

    @Test
    void recordsHttpExchangesForAdministrators() {
        var marker = UUID.randomUUID().toString();

        assertThat(mvc.get().uri("/?marker={marker}", marker)).hasStatusOk();

        assertThat(mvc.get().uri("/actuator/httpexchanges").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPathSatisfying("$.exchanges[*].request.uri", uris -> assertThat(uris).asArray()
                        .anySatisfy(uri -> assertThat(uri).asString().endsWith("/?marker=" + marker)));
    }

    @Test
    void schedulesTheOutboxAndItsHousekeeping() {
        assertThat(mvc.get().uri("/actuator/scheduledtasks").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPathSatisfying("$.fixedDelay[*].runnable.target", targets -> assertThat(targets).asArray()
                        .contains("com.personal.portfolio.mail.MailDispatcher.dispatch"))
                .hasPathSatisfying("$.cron[*].runnable.target", targets -> assertThat(targets).asArray()
                        .contains("com.personal.portfolio.mail.MailDispatcher.purge",
                                "com.personal.portfolio.auth.TokenVault.purgeExpired"));
    }

    @Test
    void neverExposesTheHeapDump() {
        assertThat(mvc.get().uri("/actuator/heapdump").with(admin())).hasStatus(HttpStatus.NOT_FOUND);
    }
}
