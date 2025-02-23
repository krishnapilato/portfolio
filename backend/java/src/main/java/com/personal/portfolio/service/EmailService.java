package com.personal.portfolio.service;

import org.apache.commons.lang3.StringUtils;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.concurrent.ConcurrentHashMap;

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

    public void sendEmail(String recipient, String subject, String body, List<String> cc, List<String> bcc, String replyTo, boolean isHtml) {
        validateEmail(recipient);
        sanitizeInput(subject);
        sanitizeInput(body);

        String emailId = UUID.randomUUID().toString();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);

        if (cc != null && !cc.isEmpty()) {
            message.setCc(cc.toArray(new String[0]));
        }
        if (bcc != null && !bcc.isEmpty()) {
            message.setBcc(bcc.toArray(new String[0]));
        }
        if (replyTo != null && isValidEmail(replyTo)) {
            message.setReplyTo(replyTo);
        }

        try {
            javaMailSender.send(message);
            emailStatusMap.put(emailId, "SENT");
            logger.info("Email successfully sent to {} with subject: {}", recipient, subject);
        } catch (Exception e) {
            emailStatusMap.put(emailId, "FAILED");
            logger.error("Failed to send email to {}: {}", recipient, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    public void sendPasswordResetEmail(String recipient, String token) {
        validateEmail(recipient);
        String resetLink = "https://prismnexus.com/reset-password?token=" + token;
        sendEmail(recipient, "Password Reset Request", "Reset your password: " + resetLink, null, null, null, false);
    }

    public void resendConfirmationEmail(String recipient) {
        validateEmail(recipient);
        String confirmationLink = "https://prismnexus.com/confirm-email?email=" + recipient;
        sendEmail(recipient, "Email Confirmation", "Confirm your email: " + confirmationLink, null, null, null, false);
        logger.info("Resent confirmation email to: {}", recipient);
    }

    public void sendBulkEmail(List<String> recipients, String subject, String body) {
        if (recipients == null || recipients.isEmpty()) {
            throw new IllegalArgumentException("Recipient list cannot be empty.");
        }

        recipients.parallelStream()
                .filter(this::isValidEmail)
                .forEach(recipient -> sendEmail(recipient, subject, body, null, null, null, false));

        logger.info("Bulk email sent to {} recipients.", recipients.size());
    }

    public String getEmailStatus(String emailId) {
        return emailStatusMap.getOrDefault(emailId, "UNKNOWN");
    }

    public boolean isValidEmail(String email) {
        return Objects.nonNull(email) && EMAIL_REGEX.matcher(email).matches();
    }

    public void sanitizeInput(String input) {
        if (StringUtils.isBlank(input)) {
            throw new IllegalArgumentException("Input cannot be null or empty.");
        }

        // Remove any dangerous characters (such as script tags, special characters)
        String sanitizedInput = input.replaceAll("[<>\"'%;()&+]", "").trim();

        // Encode the input to prevent XSS attacks
        Encode.forHtml(sanitizedInput);
    }

    public String generatePasswordResetToken() {
        byte[] randomBytes = new byte[32];
        new java.security.SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().encodeToString(randomBytes);
    }

    private void validateEmail(String email) {
        if (!isValidEmail(email)) {
            logger.warn("Invalid email address attempted: {}", email);
            throw new IllegalArgumentException("Invalid email address.");
        }
    }
}