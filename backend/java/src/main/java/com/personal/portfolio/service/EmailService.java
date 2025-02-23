package com.personal.portfolio.service;

import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.StringUtils;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final Pattern EMAIL_REGEX = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private final JavaMailSender javaMailSender;

    // Thread-safe storage for email statuses
    private final Map<String, String> emailStatusMap = new ConcurrentHashMap<>();

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Sanitizes the input string by removing dangerous characters and encoding for HTML.
     * Returns the sanitized string.
     */
    public String sanitizeInput(String input) {
        if (StringUtils.isBlank(input)) {
            throw new IllegalArgumentException("Input cannot be null or empty.");
        }
        String sanitizedInput = input.replaceAll("[<>\"'%;()&+]", "").trim();
        return Encode.forHtml(sanitizedInput);
    }

    /**
     * Sends an email. Supports both plain text and HTML content based on the isHtml flag.
     */
    public void sendEmail(String recipient, String subject, String body, List<String> cc, List<String> bcc, String replyTo, boolean isHtml) {
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
                if (cc != null && !cc.isEmpty()) {
                    helper.setCc(cc.toArray(new String[0]));
                }
                if (bcc != null && !bcc.isEmpty()) {
                    helper.setBcc(bcc.toArray(new String[0]));
                }
                if (replyTo != null && isValidEmail(replyTo)) {
                    helper.setReplyTo(replyTo);
                }
                javaMailSender.send(mimeMessage);
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setSubject(sanitizedSubject);
                message.setText(sanitizedBody);
                if (cc != null && !cc.isEmpty()) {
                    message.setCc(cc.toArray(new String[0]));
                }
                if (bcc != null && !bcc.isEmpty()) {
                    message.setBcc(bcc.toArray(new String[0]));
                }
                if (replyTo != null && isValidEmail(replyTo)) {
                    message.setReplyTo(replyTo);
                }
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
     * Sends a password reset email.
     */
    public void sendPasswordResetEmail(String recipient, String token) {
        validateEmail(recipient);
        String resetLink = "https://prismnexus.com/reset-password?token=" + token;
        sendEmail(recipient, "Password Reset Request", "Reset your password: " + resetLink, null, null, null, false);
    }

    /**
     * Resends the email confirmation.
     */
    public void resendConfirmationEmail(String recipient) {
        validateEmail(recipient);
        String confirmationLink = "https://prismnexus.com/confirm-email?email=" + recipient;
        sendEmail(recipient, "Email Confirmation", "Confirm your email: " + confirmationLink, null, null, null, false);
        logger.info("Resent confirmation email to: {}", recipient);
    }

    /**
     * Sends bulk emails using a parallel stream. Only valid email addresses are processed.
     */
    public void sendBulkEmail(List<String> recipients, String subject, String body) {
        if (recipients == null || recipients.isEmpty()) {
            throw new IllegalArgumentException("Recipient list cannot be empty.");
        }
        String sanitizedSubject = sanitizeInput(subject);
        String sanitizedBody = sanitizeInput(body);

        recipients.parallelStream()
                .filter(this::isValidEmail)
                .forEach(recipient -> sendEmail(recipient, sanitizedSubject, sanitizedBody, null, null, null, false));

        logger.info("Bulk email sent to {} recipients.", recipients.size());
    }

    /**
     * Returns the status of an email by its unique identifier.
     */
    public String getEmailStatus(String emailId) {
        return emailStatusMap.getOrDefault(emailId, "UNKNOWN");
    }

    /**
     * Validates the given email against a simple regex.
     */
    public boolean isValidEmail(String email) {
        return Objects.nonNull(email) && EMAIL_REGEX.matcher(email).matches();
    }

    /**
     * Generates a secure password reset token.
     */
    public String generatePasswordResetToken() {
        byte[] randomBytes = new byte[32];
        new java.security.SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().encodeToString(randomBytes);
    }

    /**
     * Validates the email and throws an exception if it is invalid.
     */
    private void validateEmail(String email) {
        if (!isValidEmail(email)) {
            logger.warn("Invalid email address attempted: {}", email);
            throw new IllegalArgumentException("Invalid email address.");
        }
    }

    /**
     * New Feature: Sends an email with attachments.
     * @param attachments A map where the key is the filename and the value is the file's byte content.
     */
    public void sendEmailWithAttachment(String recipient, String subject, String body, List<String> cc,
                                        List<String> bcc, String replyTo, boolean isHtml, Map<String, byte[]> attachments) {
        validateEmail(recipient);
        String sanitizedSubject = sanitizeInput(subject);
        String sanitizedBody = sanitizeInput(body);
        String emailId = UUID.randomUUID().toString();

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            // 'true' flag enables multipart mode
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(recipient);
            helper.setSubject(sanitizedSubject);
            helper.setText(sanitizedBody, isHtml);
            if (cc != null && !cc.isEmpty()) {
                helper.setCc(cc.toArray(new String[0]));
            }
            if (bcc != null && !bcc.isEmpty()) {
                helper.setBcc(bcc.toArray(new String[0]));
            }
            if (replyTo != null && isValidEmail(replyTo)) {
                helper.setReplyTo(replyTo);
            }
            if (attachments != null && !attachments.isEmpty()) {
                for (Map.Entry<String, byte[]> entry : attachments.entrySet()) {
                    helper.addAttachment(entry.getKey(), new ByteArrayResource(entry.getValue()));
                }
            }
            javaMailSender.send(mimeMessage);
            emailStatusMap.put(emailId, "SENT");
            logger.info("Email with attachments successfully sent to {} with subject: {}", recipient, sanitizedSubject);
        } catch (Exception e) {
            emailStatusMap.put(emailId, "FAILED: " + e.getMessage());
            logger.error("Failed to send email with attachment to {}: {}", recipient, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    /**
     * New Feature: Schedules an email to be sent at a later time.
     */
    public void scheduleEmail(String recipient, String subject, String body, List<String> cc,
                              List<String> bcc, String replyTo, boolean isHtml, Date sendTime) {
        Timer timer = new Timer();
        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                sendEmail(recipient, subject, body, cc, bcc, replyTo, isHtml);
            }
        };
        timer.schedule(task, sendTime);
        logger.info("Scheduled email to {} at {}", recipient, sendTime);
    }
}