package com.personal.portfolio.service;

import jakarta.mail.MessagingException;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Validated
@RequiredArgsConstructor
public class EmailService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JavaMailSender javaMailSender;
    private final TaskScheduler taskScheduler;

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    public void sendEmail(
            @NotBlank @Email String recipient,
            @NotBlank String subject,
            @NotBlank String body,
            List<@Email String> cc,
            List<@Email String> bcc,
            @Email String replyTo,
            boolean isHtml) {

        try {
            if (isHtml) {
                var mimeMessage = javaMailSender.createMimeMessage();
                var helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(body, true);
                setOptionalRecipients(helper, cc, bcc, replyTo);
                javaMailSender.send(mimeMessage);
            } else {
                var message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(body);
                setOptionalRecipients(message, cc, bcc, replyTo);
                javaMailSender.send(message);
            }
            log.info("Email successfully sent to {} with subject: {}", recipient, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", recipient, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    public void sendEmailWithAttachment(
            @NotBlank @Email String recipient,
            @NotBlank String subject,
            @NotBlank String body,
            List<@Email String> cc,
            List<@Email String> bcc,
            @Email String replyTo,
            boolean isHtml,
            Map<String, byte[]> attachments) {

        try {
            var mimeMessage = javaMailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(body, isHtml);
            setOptionalRecipients(helper, cc, bcc, replyTo);

            if (attachments != null) {
                for (var attachment : attachments.entrySet()) {
                    helper.addAttachment(attachment.getKey(), new ByteArrayResource(attachment.getValue()));
                }
            }
            javaMailSender.send(mimeMessage);
            log.info("Email with attachments successfully sent to {}", recipient);
        } catch (Exception e) {
            log.error("Failed to send email with attachments to {}", recipient, e);
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    public void sendPasswordResetEmail(@NotBlank @Email String recipient, @NotBlank String token) {
        var resetLink = appBaseUrl + "/reset-password?token=" + token;
        var message = """
                A password reset was requested for your account.

                Use this reset token:
                %s

                If your client supports reset links, open:
                %s
                """.formatted(token, resetLink);
        sendEmail(recipient, "Password Reset Request", message, null, null, null, false);
    }

    public void sendBulkEmail(
            @NotEmpty List<@NotBlank @Email String> recipients,
            @NotBlank String subject,
            @NotBlank String body) {

        int successCount = 0;
        int failureCount = 0;

        for (String recipient : recipients) {
            try {
                sendEmail(recipient, subject, body, null, null, null, false);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                log.warn("Failed to send bulk email to {}: {}", recipient, e.getMessage());
            }
        }
        log.info("Bulk email completed: {} successful, {} failed out of {}", successCount, failureCount, recipients.size());
    }

    public void scheduleEmail(
            @NotBlank @Email String recipient,
            @NotBlank String subject,
            @NotBlank String body,
            List<@Email String> cc,
            List<@Email String> bcc,
            @Email String replyTo,
            boolean isHtml,
            @Future Instant sendTime) {

        taskScheduler.schedule(() -> {
            try {
                sendEmail(recipient, subject, body, cc, bcc, replyTo, isHtml);
            } catch (Exception e) {
                log.error("Failed to send scheduled email to {}", recipient, e);
            }
        }, sendTime);

        log.info("Scheduled email for {} at {}", recipient, sendTime);
    }

    public String generatePasswordResetToken() {
        var randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private void setOptionalRecipients(MimeMessageHelper helper, List<String> cc, List<String> bcc, String replyTo) throws MessagingException {
        if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
        if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]));
        if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo);
    }

    private void setOptionalRecipients(SimpleMailMessage message, List<String> cc, List<String> bcc, String replyTo) {
        if (cc != null && !cc.isEmpty()) message.setCc(cc.toArray(new String[0]));
        if (bcc != null && !bcc.isEmpty()) message.setBcc(bcc.toArray(new String[0]));
        if (replyTo != null && !replyTo.isBlank()) message.setReplyTo(replyTo);
    }
}
