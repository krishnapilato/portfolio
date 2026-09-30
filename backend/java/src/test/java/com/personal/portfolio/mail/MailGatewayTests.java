package com.personal.portfolio.mail;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.personal.portfolio.support.AppPropertiesFixture;
import jakarta.mail.Address;
import jakarta.mail.Message.RecipientType;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.ContentType;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;

class MailGatewayTests {

    private static final Session SESSION = Session.getInstance(new Properties());

    private final JavaMailSender sender = mock(JavaMailSender.class);
    private final MailGateway gateway = new MailGateway(sender, AppPropertiesFixture.defaults());

    @BeforeEach
    void createRealMimeMessages() {
        given(sender.createMimeMessage()).willAnswer(_ -> new MimeMessage(SESSION));
    }

    @Test
    void sendsAnHtmlMessageFromTheConfiguredSenderToEveryRecipient() throws Exception {
        gateway.send(new Envelope(List.of("ada@example.test", "alan@example.test"), List.of("grace@example.test"),
                List.of("audit@example.test"), "support@example.test", "Grüße aus Zürich", "<p>Hallo Welt</p>", true,
                List.of()));

        var mime = sent();
        mime.saveChanges();
        var from = (InternetAddress) mime.getFrom()[0];
        assertThat(from.getAddress()).isEqualTo(AppPropertiesFixture.MAIL_FROM);
        assertThat(from.getPersonal()).isEqualTo(AppPropertiesFixture.MAIL_SENDER);
        assertThat(addresses(mime.getRecipients(RecipientType.TO))).containsExactly("ada@example.test",
                "alan@example.test");
        assertThat(addresses(mime.getRecipients(RecipientType.CC))).containsExactly("grace@example.test");
        assertThat(addresses(mime.getRecipients(RecipientType.BCC))).containsExactly("audit@example.test");
        assertThat(addresses(mime.getReplyTo())).containsExactly("support@example.test");
        assertThat(mime.getSubject()).isEqualTo("Grüße aus Zürich");
        assertThat(mime.getContent()).isEqualTo("<p>Hallo Welt</p>");
        assertThat(mime.getContentType()).startsWith("text/html").containsIgnoringCase("charset=UTF-8");
    }

    @Test
    void sendsPlainTextWithoutReplyToWhenNoneIsGiven() throws Exception {
        gateway.send(new Envelope(List.of("ada@example.test"), List.of(), List.of(), null, "Plain", "Just text", false,
                List.of()));

        var mime = sent();
        mime.saveChanges();
        assertThat(mime.getHeader("Reply-To")).isNull();
        assertThat(mime.getRecipients(RecipientType.CC)).isNull();
        assertThat(mime.getContent()).isEqualTo("Just text");
        assertThat(mime.getContentType()).startsWith("text/plain");
    }

    @Test
    void attachesEveryFileInAMultipartMessage() throws Exception {
        var csv = "id,name\n1,Ada\n".getBytes(UTF_8);
        var png = new byte[] {(byte) 0x89, 'P', 'N', 'G'};
        gateway.send(new Envelope(List.of("ada@example.test"), List.of(), List.of(), null, "Report", "See attached",
                false, List.of(new Attachment("report.csv", "text/csv", csv), new Attachment("logo.png", "image/png", png))));

        var mime = sent();
        mime.saveChanges();
        assertThat(mime.getContent()).isInstanceOf(MimeMultipart.class);
        assertThat(attachments((MimeMultipart) mime.getContent()))
                .containsExactly(tuple("report.csv", "text/csv", csv), tuple("logo.png", "image/png", png));
    }

    @Test
    void reportsUnparseableAddressesAsPreparationFailuresWithoutSending() {
        assertThatThrownBy(() -> gateway.send(Envelope.html("broken<address", "Hello", "<p>Hi</p>")))
                .isInstanceOf(MailPreparationException.class)
                .hasCauseInstanceOf(AddressException.class);
        verify(sender, never()).send(any(MimeMessage.class));
    }

    private MimeMessage sent() {
        var captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        return captor.getValue();
    }

    private static List<String> addresses(Address[] addresses) {
        return Arrays.stream(addresses).map(address -> ((InternetAddress) address).getAddress()).toList();
    }

    private static List<Tuple> attachments(MimeMultipart multipart) throws MessagingException, IOException {
        var attachments = new ArrayList<Tuple>();
        for (var index = 0; index < multipart.getCount(); index++) {
            var part = multipart.getBodyPart(index);
            if (part.getFileName() != null) {
                try (var content = part.getInputStream()) {
                    attachments.add(tuple(part.getFileName(), new ContentType(part.getContentType()).getBaseType(),
                            content.readAllBytes()));
                }
            }
        }
        return attachments;
    }
}
