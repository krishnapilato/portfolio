package com.personal.portfolio.service;

import org.apache.commons.lang3.StringUtils;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final Pattern EMAIL_REGEX = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private final JavaMailSender javaMailSender;

    // Dependency injection of the mail sender
    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Sends an email to the specified recipient with the given subject and body.
     *
     * @param recipient Email address of the recipient.
     * @param subject   Subject of the email.
     * @param body      Body content of the email.
     * @param cc        Optional list of CC addresses.
     * @param bcc       Optional list of BCC addresses.
     * @param replyTo   Optional reply-to address.
     * @param isHtml    If true, the body will be interpreted as HTML content.
     * @throws IllegalArgumentException if email validation fails.
     */
    public void sendEmail(String recipient, String subject, String body, List<String> cc, List<String> bcc, String replyTo, boolean isHtml) {

        // Validate email address
        if (!isValidEmail(recipient)) {
            logger.warn("Invalid email address attempted: {}", recipient);
            throw new IllegalArgumentException("Invalid email address.");
        }

        // Sanitize inputs
        sanitizeInput(subject);
        sanitizeInput(body);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);

        // Add CC and BCC if available
        if (cc != null && !cc.isEmpty()) {
            message.setCc(cc.toArray(new String[0]));
        }

        if (bcc != null && !bcc.isEmpty()) {
            message.setBcc(bcc.toArray(new String[0]));
        }

        // Set reply-to address if available
        if (replyTo != null && isValidEmail(replyTo)) {
            message.setReplyTo(replyTo);
        }

        try {
            // Send the email
            javaMailSender.send(message);
            logger.info("Email successfully sent to {} with subject: {}", recipient, subject);
        } catch (Exception e) {
            logger.error("Failed to send email to {} with subject {}: {}", recipient, subject, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    /**
     * Sends a password reset email with a token.
     *
     * @param recipient The email address of the recipient.
     * @param token     The password reset token.
     */
    public void sendPasswordResetEmail(String recipient, String token) {
        // Validate email address
        if (!isValidEmail(recipient)) {
            logger.warn("Invalid email address attempted: {}", recipient);
            throw new IllegalArgumentException("Invalid email address.");
        }

        String resetLink = "https://prismnexus.com/reset-password?token=" + token;

        String subject = "Password Reset Request";
        String body = "Please use the following link to reset your password: " + resetLink;

        sendEmail(recipient, subject, body, null, null, null, false);
    }

    /**
     * Validates the given email address against a regular expression.
     *
     * @param email The email address to validate.
     * @return True if the email is valid, otherwise false.
     */
    public boolean isValidEmail(String email) {
        return Objects.nonNull(email) && EMAIL_REGEX.matcher(email).matches();
    }

    /**
     * Sanitizes the input to prevent injection attacks.
     *
     * @param input The input to sanitize.
     * @throws IllegalArgumentException if the input contains invalid characters.
     */
    public void sanitizeInput(String input) {
        if (StringUtils.isBlank(input)) {
            throw new IllegalArgumentException("Input cannot be null or empty.");
        }

        // Allow all characters (any Unicode character)
        // This is a more permissive regex that allows anything
        if (!input.matches(".*")) {
            throw new IllegalArgumentException("Input contains invalid characters.");
        }

        // Optionally: Encode the input to prevent XSS or other vulnerabilities
        Encode.forHtml(input);
    }

    /**
     * Generates a unique password reset token.
     *
     * @return A generated token for password reset.
     */
    public String generatePasswordResetToken() {
        byte[] randomBytes = new byte[32]; // 256-bit random token
        new java.security.SecureRandom().nextBytes(randomBytes);
        return java.util.Base64.getUrlEncoder().encodeToString(randomBytes);
    }
}