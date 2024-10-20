package com.personal.portfolio.controller;

import com.personal.portfolio.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestParam String recipient,
                                            @RequestParam String subject,
                                            @RequestParam String body) {
        logger.info("Received request to send email to: {}", recipient);
        try {
            emailService.sendEmail(recipient, subject, body);
            logger.info("Email sent successfully to: {}", recipient);
            return ResponseEntity.status(HttpStatus.OK).body("Email sent successfully.");
        } catch (Exception e) {
            logger.error("Failed to send email to: {}. Error: {}", recipient, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email: " + e.getMessage());
        }
    }
}