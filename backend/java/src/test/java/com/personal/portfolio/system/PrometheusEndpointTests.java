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

@AutoConfigureMetrics
@TestPropertySource(properties = "app.security.scrape-password=" + PrometheusEndpointTests.SCRAPE_PASSWORD)
class PrometheusEndpointTests extends IntegrationTest {

    private static final String SCRAPER = "prometheus";
    static final String SCRAPE_PASSWORD = "Scrape-Passw0rd";

    @Autowired
    private ApplicationEventPublisher events;

    @Test
    void requiresAnAdministrator() {
        assertThat(mvc.get().uri("/actuator/prometheus")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/actuator/prometheus").with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
    }

    @Test
    void letsTheMetricsScraperInWithBasicAuthentication() {
        assertThat(mvc.get().uri("/actuator/prometheus").with(httpBasic(SCRAPER, SCRAPE_PASSWORD)))
                .hasStatusOk()
                .bodyText()
                .contains("jvm_memory_used_bytes{");
    }

    @Test
    void rejectsTheMetricsScraperWithAWrongPassword() {
        assertThat(mvc.get().uri("/actuator/prometheus").with(httpBasic(SCRAPER, "Wrong-Passw0rd")))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void keepsTheMetricsScraperOutOfEveryOtherEndpoint() {
        assertThat(mvc.get().uri("/actuator/env").with(httpBasic(SCRAPER, SCRAPE_PASSWORD)))
                .hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/api/v1/users").with(httpBasic(SCRAPER, SCRAPE_PASSWORD)))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void isAdvertisedAmongTheEndpointLinks() {
        assertThat(mvc.get().uri("/actuator"))
                .hasStatusOk()
                .bodyJson()
                .hasPath("$._links.prometheus.href");
    }

    @Test
    void exposesJvmHttpAndApplicationMetricsForScraping() {
        assertThat(mvc.get().uri("/system/snapshot")).hasStatusOk();

        assertThat(mvc.get().uri("/actuator/prometheus").with(admin()))
                .hasStatusOk()
                .hasContentTypeCompatibleWith(MediaType.TEXT_PLAIN)
                .bodyText()
                .contains("jvm_memory_used_bytes{")
                .contains("application=\"portfolio\"")
                .contains("http_server_requests_seconds_bucket{")
                .contains("uri=\"/system/snapshot\"")
                .contains("portfolio_dashboard_subscribers{")
                .contains("portfolio_mail_dispatched_total{");
    }

    @Test
    void exportsAuditEventCountersByType() {
        var type = "PROMETHEUS_PROBE_" + UUID.randomUUID().toString().replace("-", "_");

        events.publishEvent(new AuditApplicationEvent("prometheus-probe", type, Map.of()));

        assertThat(mvc.get().uri("/actuator/prometheus").with(admin()))
                .hasStatusOk()
                .bodyText()
                .containsPattern(Pattern.compile("portfolio_audit_events_total[{][^}]*type=\"" + type + "\"[^}]*[}] 1[.]0"));
    }
}
