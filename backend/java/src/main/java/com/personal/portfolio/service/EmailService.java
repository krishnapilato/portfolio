package com.personal.portfolio.service;

import jakarta.annotation.PreDestroy;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Service
@Validated
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final Pattern EMAIL_REGEX = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom(); // Reused instance

    private final JavaMailSender javaMailSender;
    private final Map<String, String> emailStatusMap = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Sanitizes the input string by removing dangerous characters and escaping HTML.
     *
     * @param input the raw input string.
     * @return a sanitized string safe for HTML contexts.
     * @throws IllegalArgumentException if input is null or empty.
     */
    public String sanitizeInput(@NotBlank String input) {
        if (StringUtils.isBlank(input)) {
            throw new IllegalArgumentException("Input cannot be null or empty.");
        }
        // More efficient pattern-based replacement and trim before escaping
        String sanitized = input.replaceAll("[<>\"'%;()&+]", "");
        return StringEscapeUtils.escapeHtml4(sanitized.trim());
    }

    /**
     * Sends an email with the given parameters.
     * Supports plain text and HTML emails.
     *
     * @param recipient recipient email address.
     * @param subject   email subject.
     * @param body      email body.
     * @param cc        optional CC addresses.
     * @param bcc       optional BCC addresses.
     * @param replyTo   optional reply-to address.
     * @param isHtml    flag to indicate if content is HTML.
     */
    public void sendEmail(
            @NotBlank @Email String recipient,
            @NotBlank String subject,
            @NotBlank String body,
            List<@NotBlank @Email String> cc,
            List<@NotBlank @Email String> bcc,
            @Email String replyTo,
            boolean isHtml) {

        validateEmail(recipient);
        String sanitizedSubject = sanitizeInput(subject);
        String sanitizedBody = sanitizeInput(body);
        String emailId = UUID.randomUUID().toString();

        try {
            if (isHtml) {
                MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
                helper.setTo(recipient);
                helper.setSubject(sanitizedSubject);
                helper.setText(sanitizedBody, true);
                setOptionalRecipients(helper, cc, bcc, replyTo);
                javaMailSender.send(mimeMessage);
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setSubject(sanitizedSubject);
                message.setText(sanitizedBody);
                setOptionalRecipients(message, cc, bcc, replyTo);
                javaMailSender.send(message);
            }
            emailStatusMap.put(emailId, "SENT");
            logger.info("Email successfully sent to {} with subject: {}", recipient, sanitizedSubject);
        } catch (Exception e) {
            emailStatusMap.put(emailId, "FAILED: " + e.getMessage());
            logger.error("Failed to send email to {}: {}", recipient, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    /**
     * Helper to set optional recipients on a MimeMessageHelper.
     */
    private void setOptionalRecipients(MimeMessageHelper helper, List<String> cc, List<String> bcc, String replyTo) throws Exception {
        if (cc != null && !cc.isEmpty()) {
            helper.setCc(cc.toArray(new String[0]));
        }
        if (bcc != null && !bcc.isEmpty()) {
            helper.setBcc(bcc.toArray(new String[0]));
        }
        if (replyTo != null && isValidEmail(replyTo)) {
            helper.setReplyTo(replyTo);
        }
    }

    /**
     * Helper to set optional recipients on a SimpleMailMessage.
     */
    private void setOptionalRecipients(SimpleMailMessage message, List<String> cc, List<String> bcc, String replyTo) {
        if (cc != null && !cc.isEmpty()) {
            message.setCc(cc.toArray(new String[0]));
        }
        if (bcc != null && !bcc.isEmpty()) {
            message.setBcc(bcc.toArray(new String[0]));
        }
        if (replyTo != null && isValidEmail(replyTo)) {
            message.setReplyTo(replyTo);
        }
    }

    /**
     * Sends a password reset email.
     *
     * @param recipient recipient email.
     * @param token     password reset token.
     */
    public void sendPasswordResetEmail(@NotBlank @Email String recipient, @NotBlank String token) {
        validateEmail(recipient);
        String resetLink = "https://prismnexus-backend.eu-south-1.elasticbeanstalk.com/reset-password?token=" + token;
        sendEmail(recipient, "Password Reset Request", "Reset your password: " + resetLink, null, null, null, false);
    }

    /**
     * Resends the email confirmation.
     *
     * @param recipient recipient email.
     */
    public void resendConfirmationEmail(@NotBlank @Email String recipient) {
        validateEmail(recipient);
        String confirmationLink = "https://prismnexus-backend.eu-south-1.elasticbeanstalk.com/confirm-email?email=" + recipient;
        sendEmail(recipient, "Email Confirmation", "Confirm your email: " + confirmationLink, null, null, null, false);
        logger.info("Resent confirmation email to: {}", recipient);
    }

    /**
     * Sends bulk emails in parallel.
     *
     * @param recipients list of recipient emails.
     * @param subject    email subject.
     * @param body       email body.
     */
    public void sendBulkEmail(
            @NotEmpty List<@NotBlank @Email String> recipients,
            @NotBlank String subject,
            @NotBlank String body) {
        String sanitizedSubject = sanitizeInput(subject);
        String sanitizedBody = sanitizeInput(body);
        
        // Filter valid recipients first to avoid processing invalid ones
        List<String> validRecipients = recipients.stream()
                .filter(this::isValidEmail)
                .toList();
        
        int successCount = 0;
        int failureCount = 0;
        
        // Sequential processing with better error handling
        for (String recipient : validRecipients) {
            try {
                sendEmail(recipient, sanitizedSubject, sanitizedBody, null, null, null, false);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                logger.warn("Failed to send bulk email to {}: {}", recipient, e.getMessage());
            }
        }
        
        logger.info("Bulk email completed: {} successful, {} failed out of {} valid recipients", 
                   successCount, failureCount, validRecipients.size());
    }

    /**
     * Retrieves the status of an email by its unique identifier.
     *
     * @param emailId unique email identifier.
     * @return email status string.
     */
    public String getEmailStatus(@NotBlank String emailId) {
        return emailStatusMap.getOrDefault(emailId, "UNKNOWN");
    }

    /**
     * Validates an email address using a regex pattern.
     *
     * @param email email address.
     * @return true if valid; false otherwise.
     */
    public boolean isValidEmail(String email) {
        return Objects.nonNull(email) && EMAIL_REGEX.matcher(email).matches();
    }

    /**
     * Generates a secure password reset token.
     *
     * @return Base64 URL-encoded token.
     */
    public String generatePasswordResetToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().encodeToString(randomBytes);
    }

    /**
     * Validates the email and throws an exception if invalid.
     *
     * @param email email address.
     */
    private void validateEmail(String email) {
        if (!isValidEmail(email)) {
            logger.warn("Invalid email address attempted: {}", email);
            throw new IllegalArgumentException("Invalid email address.");
        }
    }

    /**
     * Sends an email with attachments.
     *
     * @param recipient   recipient email.
     * @param subject     email subject.
     * @param body        email body.
     * @param cc          optional CC addresses.
     * @param bcc         optional BCC addresses.
     * @param replyTo     optional reply-to address.
     * @param isHtml      flag indicating HTML content.
     * @param attachments map of filename to file byte content.
     */
    public void sendEmailWithAttachment(
            @NotBlank @Email String recipient,
            @NotBlank String subject,
            @NotBlank String body,
            List<@NotBlank @Email String> cc,
            List<@NotBlank @Email String> bcc,
            @Email String replyTo,
            boolean isHtml,
            Map<String, byte[]> attachments) {
        validateEmail(recipient);
        String sanitizedSubject = sanitizeInput(subject);
        String sanitizedBody = sanitizeInput(body);
        String emailId = UUID.randomUUID().toString();

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(recipient);
            helper.setSubject(sanitizedSubject);
            helper.setText(sanitizedBody, isHtml);
            setOptionalRecipients(helper, cc, bcc, replyTo);

            if (attachments != null && !attachments.isEmpty()) {
                for (Map.Entry<String, byte[]> attachment : attachments.entrySet()) {
                    try {
                        helper.addAttachment(attachment.getKey(), new ByteArrayResource(attachment.getValue()));
                    } catch (MessagingException e) {
                        logger.error("Failed to add attachment {}: {}", attachment.getKey(), e.getMessage());
                        throw new RuntimeException("Failed to add attachment: " + attachment.getKey(), e);
                    }
                }
            }
            javaMailSender.send(mimeMessage);
            emailStatusMap.put(emailId, "SENT");
            logger.info("Email with attachments successfully sent to {} with subject: {}", recipient, sanitizedSubject);
        } catch (Exception e) {
            emailStatusMap.put(emailId, "FAILED: " + e.getMessage());
            logger.error("Failed to send email with attachments to {}: {}", recipient, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    /**
     * Schedules an email to be sent at a specified time.
     *
     * @param recipient recipient email.
     * @param subject   email subject.
     * @param body      email body.
     * @param cc        optional CC addresses.
     * @param bcc       optional BCC addresses.
     * @param replyTo   optional reply-to address.
     * @param isHtml    flag indicating if content is HTML.
     * @param sendTime  target send time.
     */
    public void scheduleEmail(
            @NotBlank @Email String recipient,
            @NotBlank String subject,
            @NotBlank String body,
            List<@NotBlank @Email String> cc,
            List<@NotBlank @Email String> bcc,
            @Email String replyTo,
            boolean isHtml,
            @NotNull @Future Date sendTime) {

        long delay = sendTime.getTime() - System.currentTimeMillis();
        if (delay <= 0) {
            logger.warn("Scheduled time is in the past, sending immediately for recipient: {}", recipient);
        }
        
        // Schedule the email with proper error handling
        scheduler.schedule(() -> {
            try {
                sendEmail(recipient, subject, body, cc, bcc, replyTo, isHtml);
                logger.info("Scheduled email sent to {} at {}", recipient, sendTime);
            } catch (Exception e) {
                logger.error("Failed to send scheduled email to {}: {}", recipient, e.getMessage(), e);
            }
        }, Math.max(delay, 0), TimeUnit.MILLISECONDS);
    }

    @PreDestroy
    public void shutdownScheduler() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
        logger.info("ScheduledExecutorService in EmailService has been shut down.");
    }
}