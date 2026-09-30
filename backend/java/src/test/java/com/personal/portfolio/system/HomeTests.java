package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import tools.jackson.databind.json.JsonMapper;

class HomeTests extends IntegrationTest {

    @Autowired
    private SnapshotService snapshots;

    @Autowired
    private PulseBroadcaster pulse;

    @Autowired
    private MeterRegistry registry;

    @Autowired
    private JsonMapper json;

    @AfterEach
    void closeDashboardStreams() {
        pulse.releaseAll();
    }

    @Test
    void rendersTheDashboardWithTheCurrentStatus() {
        var status = snapshots.capture().status();

        assertThat(mvc.get().uri("/").accept(MediaType.TEXT_HTML))
                .hasStatusOk()
                .hasContentTypeCompatibleWith(MediaType.TEXT_HTML)
                .hasViewName("home")
                .bodyText()
                .contains("data-health=\"" + status + "\"")
                .contains("data-status-label=\"\">" + status + "</span>")
                .contains("data-pulse-url=\"/system/pulse\"")
                .contains("data-snapshot-url=\"/system/snapshot\"")
                .contains("<script src=\"/assets/home.js\" defer=\"defer\"></script>");
    }

    @Test
    void protectsTheDashboardWithSecurityHeaders() {
        assertThat(mvc.get().uri("/"))
                .hasStatusOk()
                .containsHeader("Content-Security-Policy")
                .hasHeader("X-Frame-Options", "DENY")
                .hasHeader("X-Content-Type-Options", "nosniff")
                .hasHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    }

    @Test
    void servesTheSnapshotAsJson() {
        assertThat(mvc.get().uri("/system/snapshot"))
                .hasStatusOk()
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_JSON)
                .bodyJson()
                .hasPath("$.capturedAt")
                .hasPath("$.status")
                .hasPath("$.components.db")
                .hasPath("$.runtime.java")
                .hasPath("$.traffic.requests")
                .hasPath("$.domain.users")
                .hasPath("$.build.version")
                .hasPathSatisfying("$.runtime.java", java -> assertThat(java).isEqualTo(Runtime.version().toString()))
                .convertTo(SystemSnapshot.class)
                .satisfies(snapshot -> {
                    assertThat(snapshot.status()).isNotBlank();
                    assertThat(snapshot.components()).containsEntry("db", "UP");
                    assertThat(List.copyOf(snapshot.components().keySet())).isSorted();
                    assertThat(snapshot.runtime().vendor()).isEqualTo(System.getProperty("java.vendor"));
                    assertThat(snapshot.runtime().processors())
                            .isEqualTo(Runtime.getRuntime().availableProcessors());
                    assertThat(snapshot.runtime().heapUsed()).isPositive();
                    assertThat(snapshot.runtime().threads()).isPositive();
                    assertThat(snapshot.runtime().cpu()).isBetween(0.0, 1.0);
                    assertThat(snapshot.domain().users()).isGreaterThanOrEqualTo(3);
                    assertThat(snapshot.domain().activeUsers()).isGreaterThanOrEqualTo(3)
                            .isLessThanOrEqualTo(snapshot.domain().users());
                    assertThat(snapshot.build().version()).isNotBlank();
                });
    }

    @Test
    void servesTheSnapshotAndTheStreamToAnonymousVisitors() {
        assertThat(mvc.get().uri("/system/snapshot")).hasStatusOk();
        assertThat(mvc.get().uri("/system/pulse").asyncExchange()).request().hasAsyncStarted(true);
    }

    @Test
    void opensAnEventStreamAndPushesSnapshotsToIt() throws Exception {
        var subscribers = registry.get("portfolio.dashboard.subscribers").gauge();
        var before = subscribers.value();

        var stream = mvc.get().uri("/system/pulse").accept(MediaType.TEXT_EVENT_STREAM).asyncExchange();

        assertThat(stream).request().hasAsyncStarted(true);
        assertThat(subscribers.value()).isEqualTo(before + 1);

        pulse.broadcast();

        assertThat(stream).hasStatusOk().hasContentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM);
        var lines = stream.getResponse().getContentAsString().lines().toList();
        assertThat(lines).first().isEqualTo("event:snapshot");
        var data = lines.stream()
                .filter(line -> line.startsWith("data:"))
                .map(line -> line.substring("data:".length()).strip())
                .findFirst()
                .orElseThrow();
        assertThat(json.readValue(data, SystemSnapshot.class)).satisfies(snapshot -> {
            assertThat(snapshot.runtime().java()).isEqualTo(Runtime.version().toString());
            assertThat(snapshot.domain().users()).isGreaterThanOrEqualTo(3);
        });

        pulse.releaseAll();

        assertThat(subscribers.value()).isZero();
    }
}
