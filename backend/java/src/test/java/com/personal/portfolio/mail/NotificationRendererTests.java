package com.personal.portfolio.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import com.personal.portfolio.mail.Notification.PasswordChanged;
import com.personal.portfolio.mail.Notification.ResetPassword;
import com.personal.portfolio.mail.Notification.VerifyEmail;
import com.personal.portfolio.platform.AppProperties;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

class NotificationRendererTests extends OutboxIntegrationTest {

    private static final URI VERIFY_LINK = URI.create("https://front.test/portfolio/verify-email?token=vfy-7Qe2x9");
    private static final URI RESET_LINK = URI.create("https://front.test/portfolio/reset-password?token=rst-4Kp8z1");

    @Autowired
    private NotificationRenderer renderer;

    @Autowired
    private Notifier notifier;

    @Autowired
    private AppProperties properties;

    static Stream<Arguments> notifications() {
        return Stream.of(
                arguments(new VerifyEmail("augusta@example.test", "Augusta King", "vfy-7Qe2x9", VERIFY_LINK),
                        "Confirm your email address",
                        List.of("Augusta King", "augusta@example.test", "vfy-7Qe2x9", VERIFY_LINK.toString())),
                arguments(new ResetPassword("turing@example.test", "Alan Mathison", "rst-4Kp8z1", RESET_LINK,
                        Duration.ofHours(1)),
                        "Reset your password",
                        List.of("Alan Mathison", "rst-4Kp8z1", RESET_LINK.toString(), "1 hour")),
                arguments(new PasswordChanged("hopper@example.test", "Grace Brewster",
                        Instant.parse("2027-03-05T07:04:59Z")),
                        "Your password was changed",
                        List.of("Grace Brewster", "hopper@example.test", "5 March 2027 at 07:04 UTC")));
    }

    @ParameterizedTest
    @MethodSource("notifications")
    void rendersEveryNotificationWithItsSubjectAndDetails(Notification notification, String subject,
            List<String> details) {
        var envelope = renderer.render(notification);

        assertThat(envelope.subject()).isEqualTo(subject);
        assertThat(envelope.to()).containsExactly(notification.recipient());
        assertThat(envelope.cc()).isEmpty();
        assertThat(envelope.bcc()).isEmpty();
        assertThat(envelope.replyTo()).isNull();
        assertThat(envelope.attachments()).isEmpty();
        assertThat(envelope.html()).isTrue();
        assertThat(envelope.body())
                .contains(details)
                .contains("<title>" + subject + "</title>", properties.mail().sender(),
                        properties.frontendUrl().toString())
                .doesNotContain(" th:", "${");
    }

    @Test
    void escapesMarkupInPersonalDetails() {
        var envelope = renderer.render(new VerifyEmail("eve@example.test", "Eve <script>alert(1)</script>", "vfy-1",
                URI.create("https://front.test/portfolio/verify-email?token=vfy-1")));

        assertThat(envelope.body())
                .contains("Eve &lt;script&gt;alert(1)&lt;/script&gt;")
                .doesNotContain("<script>");
    }

    @ParameterizedTest(name = "a validity of {0} reads \"{1}\"")
    @CsvSource({
        "PT30S, 1 minute",
        "PT1M, 1 minute",
        "PT45M, 45 minutes",
        "PT90M, 90 minutes",
        "PT1H, 1 hour",
        "PT2H, 2 hours",
        "PT24H, 1 day",
        "P3D, 3 days"
    })
    void describesTheResetLinkValidityInWords(Duration validity, String words) {
        var envelope = renderer.render(new ResetPassword("turing@example.test", "Alan", "rst-1", RESET_LINK, validity));

        assertThat(envelope.body()).contains("expires in <strong>" + words + "</strong>");
    }

    @Test
    void notifierQueuesTheRenderedNotificationInTheOutbox() {
        var recipient = address();
        var before = clock.instant();

        notifier.notify(new ResetPassword(recipient, "Alan Mathison", "rst-9Zt3q5",
                URI.create("https://front.test/portfolio/reset-password?token=rst-9Zt3q5"), Duration.ofMinutes(30)));

        var queued = messages.findByStatus(MailStatus.PENDING, PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "id")))
                .stream()
                .filter(message -> message.getRecipients().equals(List.of(recipient)))
                .findFirst()
                .orElseThrow();
        assertThat(queued.getSubject()).isEqualTo("Reset your password");
        assertThat(queued.isHtml()).isTrue();
        assertThat(queued.getBody()).contains("rst-9Zt3q5", "30 minutes", "Alan Mathison");
        assertThat(queued.getScheduledAt()).isAfterOrEqualTo(before.truncatedTo(ChronoUnit.MICROS));
        withdraw(queued.getId());
    }
}
