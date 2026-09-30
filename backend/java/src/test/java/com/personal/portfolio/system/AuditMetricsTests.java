package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.boot.actuate.audit.listener.AuditApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class AuditMetricsTests extends IntegrationTest {

    private static final String COUNTER = "portfolio.audit.events";

    @Autowired
    private ApplicationEventPublisher events;

    @Autowired
    private MeterRegistry registry;

    @Autowired
    private AuditEventRepository auditEvents;

    @Test
    void countsPublishedAuditEventsByType() {
        var type = "PROBE_" + UUID.randomUUID();

        events.publishEvent(new AuditApplicationEvent("probe", type, Map.of("detail", "first")));
        events.publishEvent(new AuditApplicationEvent("probe", type, Map.of("detail", "second")));

        assertThat(registry.get(COUNTER).tag("type", type).counter().count()).isEqualTo(2.0);
        assertThat(auditEvents.find("probe", null, type)).hasSize(2);
    }

    @Test
    void countsFailedSignIns() {
        var before = count(registry, "AUTHENTICATION_FAILURE");
        var email = "metrics-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT) + "@nowhere.test";

        assertThat(mvc.post().uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s", "password": "Wrong-Passw0rd"}
                        """.formatted(email)))
                .hasStatus(HttpStatus.UNAUTHORIZED);

        assertThat(count(registry, "AUTHENTICATION_FAILURE")).isEqualTo(before + 1);
    }

    @Test
    void keepsASeparateCounterPerType() {
        var isolated = new SimpleMeterRegistry();
        var metrics = new AuditMetrics(isolated);
        var now = Instant.parse("2026-09-30T08:00:00Z");

        metrics.on(new AuditApplicationEvent(now, "1", "AUTHENTICATION_SUCCESS", Map.of()));
        metrics.on(new AuditApplicationEvent(now, "1", "AUTHENTICATION_SUCCESS", Map.of()));
        metrics.on(new AuditApplicationEvent(now, "2", "ACCOUNT_LOCKED", Map.of()));

        assertThat(count(isolated, "AUTHENTICATION_SUCCESS")).isEqualTo(2.0);
        assertThat(count(isolated, "ACCOUNT_LOCKED")).isEqualTo(1.0);
        assertThat(isolated.get(COUNTER).counters()).hasSize(2);
    }

    private static double count(MeterRegistry meters, String type) {
        var counter = meters.find(COUNTER).tag("type", type).counter();
        return counter == null ? 0 : counter.count();
    }
}
