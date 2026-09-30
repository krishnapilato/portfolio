package com.personal.portfolio.mail;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.MailNotModifiable;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

class MailMessageTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:00:00Z");
    private static final Instant LATER = NOW.plus(Duration.ofHours(3));
    private static final Duration INITIAL_BACKOFF = Duration.ofSeconds(30);
    private static final Duration MAX_BACKOFF = Duration.ofHours(1);
    private static final int MAX_ATTEMPTS = 5;
    private static final Attachment REPORT = new Attachment("report.txt", "text/plain", "quarterly".getBytes(UTF_8));
    private static final Envelope ENVELOPE = new Envelope(List.of("ada@example.test", "alan@example.test"),
            List.of("grace@example.test"), List.of("audit@example.test"), "reply@example.test", "Quarterly report",
            "<p>See attachment.</p>", true, List.of(REPORT));

    @Test
    void composesAPendingMessageFromTheEnvelope() {
        var message = MailMessage.compose(ENVELOPE, NOW, "req-01999a4e");

        assertThat(message.getStatus()).isEqualTo(MailStatus.PENDING);
        assertThat(message.getAttempts()).isZero();
        assertThat(message.getScheduledAt()).isEqualTo(NOW);
        assertThat(message.getSentAt()).isNull();
        assertThat(message.getLastError()).isNull();
        assertThat(message.getRequestId()).isEqualTo("req-01999a4e");
        assertThat(message.getRecipients()).containsExactly("ada@example.test", "alan@example.test");
        assertThat(message.getCc()).containsExactly("grace@example.test");
        assertThat(message.getBcc()).containsExactly("audit@example.test");
        assertThat(message.getReplyTo()).isEqualTo("reply@example.test");
        assertThat(message.getSubject()).isEqualTo("Quarterly report");
        assertThat(message.getBody()).isEqualTo("<p>See attachment.</p>");
        assertThat(message.isHtml()).isTrue();
        assertThat(message.getAttachments()).containsExactly(REPORT).isUnmodifiable();
    }

    @Test
    void snapshotsTheOriginalEnvelope() {
        var message = MailMessage.compose(ENVELOPE, NOW, null);

        assertThat(message.envelope()).isEqualTo(ENVELOPE).isNotSameAs(ENVELOPE);
        assertThat(message.envelope().attachments()).isUnmodifiable();
    }

    @Test
    void envelopeKeepsImmutableCopiesOfItsLists() {
        var recipients = new ArrayList<>(List.of("ada@example.test"));
        var envelope = new Envelope(recipients, List.of(), List.of(), null, "Hello", "Hi", false, List.of());
        recipients.add("mallory@example.test");

        assertThat(envelope.to()).containsExactly("ada@example.test").isUnmodifiable();
        assertThat(Envelope.html("ada@example.test", "Welcome", "<p>Hi</p>")).satisfies(html -> {
            assertThat(html.to()).containsExactly("ada@example.test");
            assertThat(html.cc()).isEmpty();
            assertThat(html.bcc()).isEmpty();
            assertThat(html.replyTo()).isNull();
            assertThat(html.html()).isTrue();
            assertThat(html.attachments()).isEmpty();
        });
        assertThat(REPORT.size()).isEqualTo(9);
    }

    @Test
    void markSentRecordsTheDeliveryTime() {
        var message = inStatus(MailStatus.PENDING);

        message.markSent(LATER);

        assertThat(message.getStatus()).isEqualTo(MailStatus.SENT);
        assertThat(message.getSentAt()).isEqualTo(LATER);
    }

    @ParameterizedTest(name = "failure #{0} is retried after {1}")
    @CsvSource({
        "1, PT30S",
        "2, PT1M",
        "3, PT2M",
        "4, PT4M",
        "5, PT8M",
        "6, PT16M",
        "7, PT32M",
        "8, PT1H",
        "9, PT1H",
        "70, PT1H"
    })
    void doublesTheBackoffAfterEachFailureUpToTheCap(int failures, Duration expectedDelay) {
        var message = inStatus(MailStatus.PENDING);

        for (var failure = 0; failure < failures; failure++) {
            message.markFailed("421 try again later", NOW, Integer.MAX_VALUE, INITIAL_BACKOFF, MAX_BACKOFF);
        }

        assertThat(message.getStatus()).isEqualTo(MailStatus.PENDING);
        assertThat(message.getAttempts()).isEqualTo(failures);
        assertThat(message.getScheduledAt()).isEqualTo(NOW.plus(expectedDelay));
        assertThat(message.getLastError()).isEqualTo("421 try again later");
    }

    @Test
    void failsPermanentlyOnceTheAttemptsAreExhausted() {
        var message = inStatus(MailStatus.PENDING);
        for (var failure = 1; failure < MAX_ATTEMPTS; failure++) {
            message.markFailed("timeout #" + failure, NOW, MAX_ATTEMPTS, INITIAL_BACKOFF, MAX_BACKOFF);
            assertThat(message.getStatus()).isEqualTo(MailStatus.PENDING);
        }
        var lastSchedule = message.getScheduledAt();

        message.markFailed("550 mailbox unavailable", LATER, MAX_ATTEMPTS, INITIAL_BACKOFF, MAX_BACKOFF);

        assertThat(message.getStatus()).isEqualTo(MailStatus.FAILED);
        assertThat(message.getAttempts()).isEqualTo(MAX_ATTEMPTS);
        assertThat(message.getLastError()).isEqualTo("550 mailbox unavailable");
        assertThat(message.getScheduledAt()).isEqualTo(lastSchedule);
        assertThat(message.getSentAt()).isNull();
    }

    @Test
    void truncatesVeryLongErrors() {
        var message = inStatus(MailStatus.PENDING);

        message.markFailed("x".repeat(1500), NOW, MAX_ATTEMPTS, INITIAL_BACKOFF, MAX_BACKOFF);

        assertThat(message.getLastError()).hasSize(1000);
    }

    @ParameterizedTest
    @EnumSource(value = MailStatus.class, names = {"FAILED", "CANCELLED"})
    void retryReschedulesFailedAndCancelledMessages(MailStatus status) {
        var message = inStatus(status);

        message.retry(LATER);

        assertThat(message.getStatus()).isEqualTo(MailStatus.PENDING);
        assertThat(message.getAttempts()).isZero();
        assertThat(message.getScheduledAt()).isEqualTo(LATER);
    }

    @ParameterizedTest
    @EnumSource(value = MailStatus.class, names = {"PENDING", "SENT"})
    void retryRejectsMessagesThatAreStillQueuedOrAlreadySent(MailStatus status) {
        var message = inStatus(status);

        assertThatThrownBy(() -> message.retry(LATER)).isInstanceOfSatisfying(ApiException.class,
                exception -> assertThat(exception.problem()).isEqualTo(new MailNotModifiable(0, status)));
        assertThat(message.getStatus()).isEqualTo(status);
    }

    @Test
    void cancelWithdrawsAPendingMessage() {
        var message = inStatus(MailStatus.PENDING);

        message.cancel();

        assertThat(message.getStatus()).isEqualTo(MailStatus.CANCELLED);
        assertThat(message.getScheduledAt()).isEqualTo(NOW);
    }

    @ParameterizedTest
    @EnumSource(value = MailStatus.class, names = "PENDING", mode = EnumSource.Mode.EXCLUDE)
    void cancelRejectsMessagesThatAreNoLongerPending(MailStatus status) {
        var message = inStatus(status);

        assertThatThrownBy(message::cancel).isInstanceOfSatisfying(ApiException.class,
                exception -> assertThat(exception.problem()).isEqualTo(new MailNotModifiable(0, status)));
        assertThat(message.getStatus()).isEqualTo(status);
    }

    private static MailMessage inStatus(MailStatus status) {
        var message = MailMessage.compose(ENVELOPE, NOW, null);
        switch (status) {
            case PENDING -> {}
            case SENT -> message.markSent(NOW);
            case FAILED -> message.markFailed("550 rejected", NOW, 1, INITIAL_BACKOFF, MAX_BACKOFF);
            case CANCELLED -> message.cancel();
        }
        assertThat(message.getStatus()).isEqualTo(status);
        return message;
    }
}
