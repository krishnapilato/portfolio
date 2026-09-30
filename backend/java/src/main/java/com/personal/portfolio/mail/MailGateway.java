package com.personal.portfolio.mail;

import com.personal.portfolio.platform.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class MailGateway {

    private final JavaMailSender sender;
    private final AppProperties properties;

    @Retryable(includes = MailSendException.class, maxRetries = 2, delay = 200, jitter = 50, multiplier = 2.0)
    public void send(Envelope envelope) {
        sender.send(mime(envelope));
    }

    private MimeMessage mime(Envelope envelope) {
        var message = sender.createMimeMessage();
        try {
            var multipart = !envelope.attachments().isEmpty();
            var helper = new MimeMessageHelper(message, multipart, StandardCharsets.UTF_8.name());
            helper.setFrom(properties.mail().from(), properties.mail().sender());
            helper.setTo(addresses(envelope.to()));
            helper.setCc(addresses(envelope.cc()));
            helper.setBcc(addresses(envelope.bcc()));
            var replyTo = envelope.replyTo();
            if (replyTo != null) {
                helper.setReplyTo(replyTo);
            }
            helper.setSubject(envelope.subject());
            helper.setText(envelope.body(), envelope.html());
            for (var attachment : envelope.attachments()) {
                helper.addAttachment(attachment.filename(), new ByteArrayResource(attachment.content()),
                        attachment.contentType());
            }
            return message;
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new MailPreparationException("Could not build the MIME message", e);
        }
    }

    private static String[] addresses(List<String> addresses) {
        return addresses.toArray(String[]::new);
    }
}
