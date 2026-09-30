package com.personal.portfolio.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import com.personal.portfolio.mail.MailPayloads.OutboxStats;
import com.personal.portfolio.platform.AppProperties;
import jakarta.mail.internet.MimeMessage;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

class MailOutboxEndpointTests extends OutboxIntegrationTest {

    private static final String OUTBOX = "/actuator/outbox";
    private static final String HEALTH = "/actuator/health";

    @Autowired
    private AppProperties properties;

    @Test
    void outboxEndpointReportsTheQueueToAdministrators() {
        var message = enqueue(Envelope.html(address(), "Count me", "<p>Queued</p>"), clock.instant());

        var result = mvc.get().uri(OUTBOX).with(admin()).exchange();

        assertThat(result).hasStatusOk();
        var stats = read(result, OutboxStats.class);
        assertThat(stats.byStatus()).containsOnlyKeys(MailStatus.values());
        assertThat(stats.byStatus().get(MailStatus.PENDING)).isPositive();
        assertThat(stats.oldestDue()).isNotNull().isBeforeOrEqualTo(reload(message.getId()).getScheduledAt());
        withdraw(message.getId());
    }

    @Test
    void outboxWriteOperationDispatchesDueMessages() {
        drainOutbox();
        var message = enqueue(Envelope.html(address(), "Manual run", "<p>Now</p>"), clock.instant());

        var result = mvc.post().uri(OUTBOX).with(admin()).exchange();

        assertThat(result).hasStatusOk();
        assertThat(result).bodyJson().extractingPath("$.sent").isEqualTo(1);
        assertThat(result).bodyJson().extractingPath("$.failed").isEqualTo(0);
        assertThat(reload(message.getId()).getStatus()).isEqualTo(MailStatus.SENT);
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void outboxEndpointIsRestrictedToAdministrators() {
        assertThat(mvc.get().uri(OUTBOX)).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri(OUTBOX).with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.post().uri(OUTBOX).with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
    }

    @Test
    void healthShowsTheOutboxComponentWithDetailsForAdministrators() {
        drainOutbox();

        var result = mvc.get().uri(HEALTH).with(admin()).exchange();

        assertThat(result).hasStatusOk();
        assertThat(result).bodyJson().extractingPath("$.components.mailOutbox.status").isEqualTo("UP");
        assertThat(result).bodyJson().extractingPath("$.components.mailOutbox.details").asMap()
                .containsKeys("pending", "failed")
                .doesNotContainKey("oldestDue");
    }

    @Test
    void healthHidesOutboxDetailsFromAnonymousCallers() {
        drainOutbox();

        var result = mvc.get().uri(HEALTH).exchange();

        assertThat(result).hasStatusOk();
        assertThat(result).bodyJson().extractingPath("$.components.mailOutbox.status").isEqualTo("UP");
        assertThat(result).bodyJson().doesNotHavePath("$.components.mailOutbox.details");
    }

    @Test
    void healthTurnsDownWhileADueMessageWaitsLongerThanStaleAfter() {
        drainOutbox();
        var waitingSince = clock.instant().minus(properties.mail().staleAfter()).minus(Duration.ofMinutes(1));
        var stuck = enqueue(Envelope.html(address(), "Stuck", "<p>Waiting</p>"), waitingSince);
        try {
            var result = mvc.get().uri(HEALTH).with(admin()).exchange();

            assertThat(result).hasStatus(HttpStatus.SERVICE_UNAVAILABLE);
            assertThat(result).bodyJson().extractingPath("$.status").isEqualTo("DOWN");
            assertThat(result).bodyJson().extractingPath("$.components.mailOutbox.status").isEqualTo("DOWN");
            assertThat(result).bodyJson().extractingPath("$.components.mailOutbox.details").asMap()
                    .containsKeys("pending", "failed", "oldestDue");
        } finally {
            withdraw(stuck.getId());
        }
        assertThat(mvc.get().uri(HEALTH).with(admin())).hasStatusOk();
    }
}
