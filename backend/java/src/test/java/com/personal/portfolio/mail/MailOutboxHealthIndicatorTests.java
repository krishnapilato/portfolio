package com.personal.portfolio.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import com.personal.portfolio.mail.MailPayloads.OutboxStats;
import com.personal.portfolio.support.AppPropertiesFixture;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.boot.health.contributor.Status;
import org.springframework.dao.DataAccessResourceFailureException;

class MailOutboxHealthIndicatorTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:00:00Z");

    private final MailService mail = mock(MailService.class);
    private final MailOutboxHealthIndicator indicator =
            new MailOutboxHealthIndicator(mail, AppPropertiesFixture.defaults(), Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void isUpWithTheQueueCountsWhenNothingIsDue() {
        given(mail.stats()).willReturn(stats(3, 1, null));

        var health = indicator.health();

        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails()).containsExactlyInAnyOrderEntriesOf(Map.of("pending", 3L, "failed", 1L));
    }

    @ParameterizedTest(name = "oldest due message waiting {0} is {1}")
    @CsvSource({
        "PT0S, UP",
        "PT5M, UP",
        "PT15M, UP",
        "PT15M0.001S, DOWN",
        "PT2H, DOWN"
    })
    void turnsDownOnceTheOldestDueMessageWaitedLongerThanStaleAfter(Duration waiting, String status) {
        var oldestDue = NOW.minus(waiting);
        given(mail.stats()).willReturn(stats(2, 0, oldestDue));

        var health = indicator.health();

        assertThat(health.getStatus().getCode()).isEqualTo(status);
        assertThat(health.getDetails()).containsExactlyInAnyOrderEntriesOf(
                Map.of("pending", 2L, "failed", 0L, "oldestDue", oldestDue));
    }

    @Test
    void isDownWhenTheOutboxCannotBeQueried() {
        given(mail.stats()).willThrow(new DataAccessResourceFailureException("database unavailable"));

        var health = indicator.health();

        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails()).containsKey("error");
    }

    private static OutboxStats stats(long pending, long failed, @Nullable Instant oldestDue) {
        return new OutboxStats(Map.of(MailStatus.PENDING, pending, MailStatus.SENT, 0L, MailStatus.FAILED, failed,
                MailStatus.CANCELLED, 0L), oldestDue);
    }
}
