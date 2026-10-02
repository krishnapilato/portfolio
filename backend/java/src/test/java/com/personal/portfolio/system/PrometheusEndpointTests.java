package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;

import com.personal.portfolio.support.IntegrationTest;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.listener.AuditApplicationEvent;
import org.springframework.boot.micrometer.metrics.test.autoconfigure.AutoConfigureMetrics;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@AutoConfigureMetrics
@TestPropertySource(properties = "app.security.scrape-password=" + PrometheusEndpointTests.SCRAPE_PASSWORD)
class PrometheusEndpointTests extends IntegrationTest {

    static final String SCRAPE_PASSWORD = "scrape-secret-0123456789abcdef";

    @Autowired
    private ApplicationEventPublisher events;

    @Test
    void acceptsOnlyTheScraperCredentials() {
        assertThat(mvc.get().uri("/actuator/prometheus")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/actuator/prometheus").with(admin())).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.get().uri("/actuator/prometheus").with(httpBasic("prometheus", "Wrong-Passw0rd")))
                .hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/actuator/prometheus").with(scraper()))
                .hasStatusOk()
                .bodyText()
                .contains("jvm_memory_used_bytes{");
    }

    @Test
    void keepsTheMetricsScraperOutOfEveryOtherEndpoint() {
        assertThat(mvc.get().uri("/actuator/env").with(scraper())).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/api/v1/users").with(scraper())).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void isAdvertisedToAdministratorsAmongTheEndpointLinks() {
        assertThat(mvc.get().uri("/actuator").with(admin()))
                .hasStatusOk()
                .bodyJson()
                .hasPath("$._links.prometheus.href");
    }

    @Test
    void exposesJvmHttpAndApplicationMetrics() {
        assertThat(mvc.get().uri("/")).hasStatusOk();

        assertThat(mvc.get().uri("/actuator/prometheus").with(scraper()))
                .hasStatusOk()
                .hasContentTypeCompatibleWith(MediaType.TEXT_PLAIN)
                .bodyText()
                .contains("jvm_memory_used_bytes{")
                .contains("application=\"portfolio\"")
                .contains("http_server_requests_seconds_bucket{")
                .contains("uri=\"/\"")
                .contains("portfolio_mail_dispatched_total{");
    }

    @Test
    void exportsAuditEventCountersByType() {
        var type = "PROMETHEUS_PROBE_" + UUID.randomUUID().toString().replace("-", "_");

        events.publishEvent(new AuditApplicationEvent("prometheus-probe", type, Map.of()));

        assertThat(mvc.get().uri("/actuator/prometheus").with(scraper()))
                .hasStatusOk()
                .bodyText()
                .containsPattern(Pattern.compile("portfolio_audit_events_total[{][^}]*type=\"" + type + "\"[^}]*[}] 1[.]0"));
    }

    private static RequestPostProcessor scraper() {
        return httpBasic("prometheus", SCRAPE_PASSWORD);
    }
}
