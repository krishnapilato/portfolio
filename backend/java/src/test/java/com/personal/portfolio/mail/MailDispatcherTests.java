package com.personal.portfolio.mail;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.willAnswer;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.personal.portfolio.mail.MailDispatcher.DispatchReport;
import com.personal.portfolio.platform.AppProperties;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.mail.Address;
import jakarta.mail.Message.RecipientType;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;

class MailDispatcherTests extends OutboxIntegrationTest {

    private static final DispatchReport NOTHING = new DispatchReport(0, 0);

    @Autowired
    private MeterRegistry meters;

    @Autowired
    private AppProperties properties;

    @BeforeEach
    void startFromADrainedOutbox() {
        drainOutbox();
    }

    @Test
    void idleRunsTouchNothing() {
        assertThat(dispatcher.dispatch()).isEqualTo(NOTHING);

        verifyNoInteractions(mailSender);
    }

    @Test
    void deliversDueMessagesAndMarksThemSent() throws Exception {
        var sentBefore = dispatched("sent");
        var failedBefore = dispatched("failed");
        var recipient = address();
        var message = enqueue(new Envelope(List.of(recipient), List.of(), List.of(), null, "Invoice", "<p>Paid</p>",
                true, List.of(new Attachment("invoice.txt", "text/plain", "total: 42".getBytes(UTF_8)))),
                clock.instant());

        var report = dispatcher.dispatch();

        assertThat(report).isEqualTo(new DispatchReport(1, 0));
        var delivered = reload(message.getId());
        assertThat(delivered.getStatus()).isEqualTo(MailStatus.SENT);
        assertThat(delivered.getSentAt()).isNotNull().isAfterOrEqualTo(delivered.getScheduledAt());
        assertThat(delivered.getAttempts()).isZero();
        assertThat(delivered.getLastError()).isNull();
        var captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        var mime = captor.getValue();
        assertThat(Arrays.stream(mime.getRecipients(RecipientType.TO)).map(Address::toString)).containsExactly(recipient);
        assertThat(mime.getSubject()).isEqualTo("Invoice");
        assertThat(mime.getContent()).isInstanceOf(MimeMultipart.class);
        var multipart = (MimeMultipart) mime.getContent();
        assertThat(multipart.getCount()).isEqualTo(2);
        assertThat(multipart.getBodyPart(1).getFileName()).isEqualTo("invoice.txt");
        assertThat(dispatched("sent")).isEqualTo(sentBefore + 1);
        assertThat(dispatched("failed")).isEqualTo(failedBefore);
    }

    @Test
    void leavesMessagesScheduledForLaterUntouched() {
        var message = enqueue(Envelope.html(address(), "Later", "<p>Soon</p>"), clock.instant().plus(Duration.ofHours(1)));

        assertThat(dispatcher.dispatch()).isEqualTo(NOTHING);

        assertThat(reload(message.getId()).getStatus()).isEqualTo(MailStatus.PENDING);
        verify(mailSender, never()).send(any(MimeMessage.class));
        withdraw(message.getId());
    }

    @Test
    void retriesTransientFailuresThenReschedulesWithBackoff() {
        willThrow(new MailSendException("421 service not available")).given(mailSender).send(any(MimeMessage.class));
        var failedBefore = dispatched("failed");
        var message = enqueue(Envelope.html(address(), "Flaky", "<p>Retry</p>"), clock.instant());
        var backoff = properties.mail().initialBackoff();
        var startedAt = clock.instant();

        var report = dispatcher.dispatch();

        var finishedAt = clock.instant();
        assertThat(report).isEqualTo(new DispatchReport(0, 1));
        verify(mailSender, times(3)).send(any(MimeMessage.class));
        assertThat(Duration.between(startedAt, finishedAt)).isGreaterThanOrEqualTo(Duration.ofMillis(400));
        var rescheduled = reload(message.getId());
        assertThat(rescheduled.getStatus()).isEqualTo(MailStatus.PENDING);
        assertThat(rescheduled.getAttempts()).isEqualTo(1);
        assertThat(rescheduled.getLastError()).isEqualTo("421 service not available");
        assertThat(rescheduled.getSentAt()).isNull();
        assertThat(rescheduled.getScheduledAt()).isBetween(startedAt.plus(backoff), finishedAt.plus(backoff));
        assertThat(dispatched("failed")).isEqualTo(failedBefore + 1);
        withdraw(message.getId());
    }

    @Test
    void doesNotRetryFailuresOtherThanSendFailures() {
        willThrow(new MailAuthenticationException("535 authentication failed"))
                .given(mailSender).send(any(MimeMessage.class));
        var message = enqueue(Envelope.html(address(), "Locked out", "<p>Nope</p>"), clock.instant());

        assertThat(dispatcher.dispatch()).isEqualTo(new DispatchReport(0, 1));

        verify(mailSender).send(any(MimeMessage.class));
        var rescheduled = reload(message.getId());
        assertThat(rescheduled.getStatus()).isEqualTo(MailStatus.PENDING);
        assertThat(rescheduled.getAttempts()).isEqualTo(1);
        assertThat(rescheduled.getLastError()).isEqualTo("535 authentication failed");
        withdraw(message.getId());
    }

    @Test
    void marksTheMessageFailedWhenTheLastAttemptFails() {
        var maxAttempts = properties.mail().maxAttempts();
        var message = MailMessage.compose(Envelope.html(address(), "Doomed", "<p>Bounce</p>"), clock.instant(), null);
        var dueAgain = clock.instant().minusSeconds(1);
        for (var attempt = 1; attempt < maxAttempts; attempt++) {
            message.markFailed("421 try again later", dueAgain, maxAttempts, Duration.ZERO, Duration.ZERO);
        }
        var id = messages.save(message).getId();
        willThrow(new MailSendException("550 mailbox unavailable")).given(mailSender).send(any(MimeMessage.class));
        var failedBefore = dispatched("failed");

        assertThat(dispatcher.dispatch()).isEqualTo(new DispatchReport(0, 1));

        var failed = reload(id);
        assertThat(failed.getStatus()).isEqualTo(MailStatus.FAILED);
        assertThat(failed.getAttempts()).isEqualTo(maxAttempts);
        assertThat(failed.getLastError()).isEqualTo("550 mailbox unavailable");
        assertThat(failed.getSentAt()).isNull();
        assertThat(dispatched("failed")).isEqualTo(failedBefore + 1);
    }

    @Test
    void settlesEveryMessageOfABatchIndependently() {
        var bounce = address();
        willAnswer(invocation -> {
            MimeMessage mime = invocation.getArgument(0);
            if (Arrays.stream(mime.getAllRecipients()).map(Address::toString).anyMatch(bounce::equals)) {
                throw new MailSendException("550 no such user");
            }
            return null;
        }).given(mailSender).send(any(MimeMessage.class));
        var sentBefore = dispatched("sent");
        var failedBefore = dispatched("failed");
        var rejected = enqueue(Envelope.html(bounce, "Hello", "<p>Bounce</p>"), clock.instant());
        var accepted = enqueue(Envelope.html(address(), "Hello", "<p>Deliver</p>"), clock.instant());

        assertThat(dispatcher.dispatch()).isEqualTo(new DispatchReport(1, 1));

        verify(mailSender, times(4)).send(any(MimeMessage.class));
        assertThat(reload(accepted.getId()).getStatus()).isEqualTo(MailStatus.SENT);
        assertThat(reload(rejected.getId())).satisfies(message -> {
            assertThat(message.getStatus()).isEqualTo(MailStatus.PENDING);
            assertThat(message.getAttempts()).isEqualTo(1);
            assertThat(message.getLastError()).isEqualTo("550 no such user");
        });
        assertThat(dispatched("sent")).isEqualTo(sentBefore + 1);
        assertThat(dispatched("failed")).isEqualTo(failedBefore + 1);
        withdraw(rejected.getId());
    }

    private double dispatched(String outcome) {
        return meters.get("portfolio.mail.dispatched").tag("outcome", outcome).counter().count();
    }
}
