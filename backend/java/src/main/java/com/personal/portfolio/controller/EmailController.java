package com.personal.portfolio.controller;

import com.personal.portfolio.service.EmailService;
import com.personal.portfolio.service.UserService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST controller for handling email-related operations.
 */
@RestController
@RequestMapping("/api/email")
public class EmailController {

    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

    private final EmailService emailService;
    private final UserService userService;

    public EmailController(EmailService emailService, UserService userService) {
        this.emailService = emailService;
        this.userService = userService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestParam @Email(message = "Invalid email address") String recipient,
            @RequestParam @NotBlank @Size(max = 100, message = "Subject must not exceed 100 characters") String subject,
            @RequestParam @NotBlank @Size(max = 1000, message = "Body must not exceed 1000 characters") String body,
            @RequestParam(required = false) List<String> cc,
            @RequestParam(required = false) List<String> bcc,
            @RequestParam(required = false) String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml) {

        logger.info("Received request to send email.");

        if (!emailService.isValidEmail(recipient)) {
            logger.warn("Invalid email address: {}", recipient);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid recipient email address.");
        }

        try {
            emailService.sendEmail(recipient, subject, body, cc, bcc, replyTo, isHtml);
            logger.info("Email sent successfully to: {}", recipient);
            return ResponseEntity.ok("Email sent successfully.");
        } catch (Exception e) {
            logger.error("Failed to send email to: {}. Error: {}", recipient, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send email. Please try again later.");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam @Email(message = "Invalid email address") String email) {
        logger.info("Received request to reset password for email: {}", email);

        if (!userService.existsByEmail(email)) {
            logger.warn("No user found with email: {}", email);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No user found with that email address.");
        }

        String resetToken = emailService.generatePasswordResetToken();
        emailService.sendPasswordResetEmail(email, resetToken);

        logger.info("Password reset token sent successfully to: {}", email);
        return ResponseEntity.ok("Password reset email sent successfully.");
    }

    /**
     * Allows users to request another email confirmation.
     *
     * @param email The email address of the user.
     * @return ResponseEntity with status message.
     */
    @PostMapping("/resend-confirmation")
    public ResponseEntity<String> resendConfirmation(@RequestParam @Email(message = "Invalid email address") String email) {
        logger.info("Received request to resend confirmation email for: {}", email);

        if (!userService.existsByEmail(email)) {
            logger.warn("No user found with email: {}", email);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No user found with that email address.");
        }

        emailService.resendConfirmationEmail(email);
        logger.info("Confirmation email resent successfully to: {}", email);
        return ResponseEntity.ok("Confirmation email resent successfully.");
    }

    /**
     * Sends an email to multiple recipients.
     *
     * @param recipients List of recipient email addresses.
     * @param subject    The subject of the email.
     * @param body       The body content of the email.
     * @return ResponseEntity with a status message.
     */
    @PostMapping("/send-bulk")
    public ResponseEntity<String> sendBulkEmail(
            @RequestParam List<@Email(message = "Invalid email address") String> recipients,
            @RequestParam @NotBlank @Size(max = 100, message = "Subject must not exceed 100 characters") String subject,
            @RequestParam @NotBlank @Size(max = 1000, message = "Body must not exceed 1000 characters") String body) {

        logger.info("Received request to send bulk email to {} recipients.", recipients.size());

        if (recipients.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recipient list cannot be empty.");
        }

        emailService.sendBulkEmail(recipients, subject, body);
        logger.info("Bulk email sent successfully to {} recipients.", recipients.size());
        return ResponseEntity.ok("Bulk email sent successfully.");
    }

    /**
     * Checks the status of a previously sent email.
     *
     * @param emailId The unique identifier of the email.
     * @return ResponseEntity with email status.
     */
    @GetMapping("/status/{emailId}")
    public ResponseEntity<String> getEmailStatus(@PathVariable String emailId) {
        logger.info("Checking email status for ID: {}", emailId);

        String status = emailService.getEmailStatus(emailId);
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found.");
        }

        logger.info("Email status for {}: {}", emailId, status);
        return ResponseEntity.ok("Email status: " + status);
    }
}