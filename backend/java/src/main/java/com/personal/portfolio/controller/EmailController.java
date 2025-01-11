package com.personal.portfolio.controller;

import com.personal.portfolio.service.EmailService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST controller for handling email-related operations.
 * Provides an endpoint to send emails with validations and safety measures.
 */
@RestController
@RequestMapping("/api/email")
public class EmailController {

    // Logger instance for logging events in the controller
    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

    // Service for handling email operations
    private final EmailService emailService;

    /**
     * Constructor to inject the EmailService dependency.
     *
     * @param emailService the service for sending emails
     */
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Endpoint to send an email.
     * Validates input parameters and ensures emails are sent only to trusted domains.
     *
     * @param recipient the recipient's email address
     * @param subject   the subject of the email
     * @param body      the body content of the email
     * @param cc        the optional CC list
     * @param bcc       the optional BCC list
     * @param replyTo   the optional reply-to address
     * @param isHtml    flag to specify if the body is HTML
     * @return ResponseEntity with a status message
     */
    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestParam @Email(message = "Invalid email address") String recipient, @RequestParam @NotBlank @Size(max = 100, message = "Subject must not exceed 100 characters") String subject, @RequestParam @NotBlank @Size(max = 1000, message = "Body must not exceed 1000 characters") String body, @RequestParam(required = false) List<String> cc, @RequestParam(required = false) List<String> bcc, @RequestParam(required = false) String replyTo, @RequestParam(defaultValue = "false") boolean isHtml) {

        logger.info("Received request to send email.");

        // Validate recipient email
        if (!emailService.isValidEmail(recipient)) {
            logger.warn("Invalid email address: {}", recipient);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid recipient email address.");
        }

        try {
            // Send the email using EmailService
            emailService.sendEmail(recipient, subject, body, cc, bcc, replyTo, isHtml);
            logger.info("Email sent successfully to: {}", recipient);
            return ResponseEntity.status(HttpStatus.OK).body("Email sent successfully.");
        } catch (Exception e) {
            // Log and handle any exceptions during the email sending process
            logger.error("Failed to send email to: {}. Error: {}", recipient, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send email. Please try again later.");
        }
    }
}