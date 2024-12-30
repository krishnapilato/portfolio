package com.personal.portfolio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final Pattern EMAIL_REGEX = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final JavaMailSender javaMailSender;

    // Dependency injection of the mail sender
    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Sends an email to the specified recipient with the given subject and body.
     *
     * @param recipient Email address of the recipient.
     * @param subject Subject of the email.
     * @param body Body content of the email.
     * @throws IllegalArgumentException if email validation fails.
     */
    public void sendEmail(String recipient, String subject, String body) {
        if (!isValidEmail(recipient)) {
            logger.warn("Invalid email address attempted: {}", recipient);
            throw new IllegalArgumentException("Invalid email address.");
        }

        sanitizeInput(subject);
        sanitizeInput(body);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);

        try {
            javaMailSender.send(message);
            logger.info("Email successfully sent to {}", recipient);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", recipient, e.getMessage());
            throw new IllegalStateException("Email sending failed.", e);
        }
    }

    /**
     * Validates the given email address against a regular expression.
     *
     * @param email The email address to validate.
     * @return True if the email is valid, otherwise false.
     */
    private boolean isValidEmail(String email) {
        return email != null && EMAIL_REGEX.matcher(email).matches();
    }

    /**
     * Sanitizes the input to prevent injection attacks.
     *
     * @param input The input to sanitize.
     * @return The sanitized input.
     */
    private String sanitizeInput(String input) {
        if (input == null || input.contains("\r") || input.contains("\n")) {
            throw new IllegalArgumentException("Input contains invalid characters.");
        }
        return input;
    }
}