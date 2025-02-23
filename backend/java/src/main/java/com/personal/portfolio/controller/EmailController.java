package com.personal.portfolio.controller;

import com.personal.portfolio.service.EmailService;
import com.personal.portfolio.service.UserService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    /**
     * Endpoint to send a single email.
     * Validates the recipient email, then delegates sending to the email service.
     *
     * @param recipient The recipient's email address.
     * @param subject   The subject of the email.
     * @param body      The body content of the email.
     * @param cc        Optional list of CC email addresses.
     * @param bcc       Optional list of BCC email addresses.
     * @param replyTo   Optional reply-to email address.
     * @param isHtml    Flag to indicate if the email body contains HTML.
     * @return ResponseEntity with a status message.
     */
    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestParam @Email(message = "Invalid email address") String recipient,
            @RequestParam @NotBlank @Size(max = 100, message = "Subject must not exceed 100 characters") String subject,
            @RequestParam @NotBlank @Size(max = 1000, message = "Body must not exceed 1000 characters") String body,
            @RequestParam(required = false) List<String> cc,
            @RequestParam(required = false) List<String> bcc,
            @RequestParam(required = false) String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml) {

        logger.info("Received request to send email to: {}", recipient);

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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send email. Please try again later.");
        }
    }

    /**
     * Endpoint to initiate a password reset process.
     * Verifies user existence and sends a reset token email.
     *
     * @param email The email address for which the password reset is requested.
     * @return ResponseEntity with a status message.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestParam @Email(message = "Invalid email address") String email) {

        logger.info("Received request to reset password for email: {}", email);

        if (!userService.existsByEmail(email)) {
            logger.warn("No user found with email: {}", email);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No user found with that email address.");
        }

        String resetToken = emailService.generatePasswordResetToken();
        emailService.sendPasswordResetEmail(email, resetToken);

        logger.info("Password reset token sent successfully to: {}", email);
        return ResponseEntity.ok("Password reset email sent successfully.");
    }

    /**
     * Endpoint to resend email confirmation.
     * Validates the user's email and resends the confirmation email.
     *
     * @param email The email address to resend the confirmation to.
     * @return ResponseEntity with a status message.
     */
    @PostMapping("/resend-confirmation")
    public ResponseEntity<String> resendConfirmation(
            @RequestParam @Email(message = "Invalid email address") String email) {

        logger.info("Received request to resend confirmation email for: {}", email);

        if (!userService.existsByEmail(email)) {
            logger.warn("No user found with email: {}", email);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No user found with that email address.");
        }

        emailService.resendConfirmationEmail(email);
        logger.info("Confirmation email resent successfully to: {}", email);
        return ResponseEntity.ok("Confirmation email resent successfully.");
    }

    /**
     * Endpoint to send bulk emails.
     * Iterates through a list of recipients and sends an email to each.
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
     * Endpoint to check the status of a sent email.
     *
     * @param emailId The unique identifier of the email.
     * @return ResponseEntity with the email status.
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

    /**
     * Sends an email with attachments.
     *
     * @param recipient   Recipient email address.
     * @param subject     Email subject.
     * @param body        Email body.
     * @param cc          List of CC addresses.
     * @param bcc         List of BCC addresses.
     * @param replyTo     Reply-to address.
     * @param isHtml      Flag to indicate HTML content.
     * @param attachments Array of files to attach.
     * @return ResponseEntity with status message.
     */
    @PostMapping("/send-with-attachment")
    public ResponseEntity<String> sendEmailWithAttachment(
            @RequestParam @Email(message = "Invalid email address") String recipient,
            @RequestParam @NotBlank @Size(max = 100, message = "Subject must not exceed 100 characters") String subject,
            @RequestParam @NotBlank @Size(max = 1000, message = "Body must not exceed 1000 characters") String body,
            @RequestParam(required = false) List<String> cc,
            @RequestParam(required = false) List<String> bcc,
            @RequestParam(required = false) String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml,
            @RequestParam(required = false) MultipartFile[] attachments) {

        logger.info("Received request to send email with attachments to: {}", recipient);

        if (!emailService.isValidEmail(recipient)) {
            logger.warn("Invalid email address: {}", recipient);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid recipient email address.");
        }

        // Convert MultipartFile[] to Map<String, byte[]>
        Map<String, byte[]> attachmentMap = new HashMap<>();
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                try {
                    attachmentMap.put(file.getOriginalFilename(), file.getBytes());
                } catch (Exception e) {
                    logger.error("Failed to process attachment {}: {}", file.getOriginalFilename(), e.getMessage());
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to process attachments.");
                }
            }
        }

        try {
            emailService.sendEmailWithAttachment(recipient, subject, body, cc, bcc, replyTo, isHtml, attachmentMap);
            logger.info("Email with attachments sent successfully to: {}", recipient);
            return ResponseEntity.ok("Email with attachments sent successfully.");
        } catch (Exception e) {
            logger.error("Failed to send email with attachments to: {}. Error: {}", recipient, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send email with attachments. Please try again later.");
        }
    }

    /**
     * Schedules an email to be sent at a later time.
     *
     * @param recipient   Recipient email address.
     * @param subject     Email subject.
     * @param body        Email body.
     * @param cc          List of CC addresses.
     * @param bcc         List of BCC addresses.
     * @param replyTo     Reply-to address.
     * @param isHtml      Flag to indicate HTML content.
     * @param sendTime    Scheduled time to send the email (ISO date-time format).
     * @return ResponseEntity with status message.
     */
    @PostMapping("/schedule")
    public ResponseEntity<String> scheduleEmail(
            @RequestParam @Email(message = "Invalid email address") String recipient,
            @RequestParam @NotBlank @Size(max = 100, message = "Subject must not exceed 100 characters") String subject,
            @RequestParam @NotBlank @Size(max = 1000, message = "Body must not exceed 1000 characters") String body,
            @RequestParam(required = false) List<String> cc,
            @RequestParam(required = false) List<String> bcc,
            @RequestParam(required = false) String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date sendTime) {

        logger.info("Received request to schedule email to: {} at {}", recipient, sendTime);

        if (!emailService.isValidEmail(recipient)) {
            logger.warn("Invalid email address: {}", recipient);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid recipient email address.");
        }

        if (sendTime.before(new Date())) {
            logger.warn("Scheduled send time {} is in the past.", sendTime);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Scheduled time must be in the future.");
        }

        try {
            emailService.scheduleEmail(recipient, subject, body, cc, bcc, replyTo, isHtml, sendTime);
            logger.info("Email scheduled successfully to: {} at {}", recipient, sendTime);
            return ResponseEntity.ok("Email scheduled successfully.");
        } catch (Exception e) {
            logger.error("Failed to schedule email for: {}. Error: {}", recipient, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to schedule email. Please try again later.");
        }
    }
}