package com.personal.portfolio.controller;

import com.personal.portfolio.service.EmailService;
import com.personal.portfolio.service.UserService;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final UserService userService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestParam @Email(message = "Invalid email address") String recipient,
            @RequestParam @NotBlank @Size(max = 100) String subject,
            @RequestParam @NotBlank @Size(max = 1000) String body,
            @RequestParam(required = false) List<@Email String> cc,
            @RequestParam(required = false) List<@Email String> bcc,
            @RequestParam(required = false) @Email String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml) {

        emailService.sendEmail(recipient, subject, body, cc, bcc, replyTo, isHtml);
        return ResponseEntity.ok("Email sent successfully.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam @Email String email) {
        if (!userService.existsByEmail(email)) {
            throw new UsernameNotFoundException("No user found with that email address.");
        }

        var resetToken = emailService.generatePasswordResetToken();
        emailService.sendPasswordResetEmail(email, resetToken);

        return ResponseEntity.ok("Password reset email sent successfully.");
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<String> resendConfirmation(@RequestParam @Email String email) {
        if (!userService.existsByEmail(email)) {
            throw new UsernameNotFoundException("No user found with that email address.");
        }

        emailService.resendConfirmationEmail(email);
        return ResponseEntity.ok("Confirmation email resent successfully.");
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<String> sendBulkEmail(
            @RequestParam @NotEmpty List<@Email String> recipients,
            @RequestParam @NotBlank @Size(max = 100) String subject,
            @RequestParam @NotBlank @Size(max = 1000) String body) {

        emailService.sendBulkEmail(recipients, subject, body);
        return ResponseEntity.ok("Bulk email sent successfully.");
    }

    @PostMapping("/send-with-attachment")
    public ResponseEntity<String> sendEmailWithAttachment(
            @RequestParam @Email String recipient,
            @RequestParam @NotBlank @Size(max = 100) String subject,
            @RequestParam @NotBlank @Size(max = 1000) String body,
            @RequestParam(required = false) List<@Email String> cc,
            @RequestParam(required = false) List<@Email String> bcc,
            @RequestParam(required = false) @Email String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml,
            @RequestParam(required = false) MultipartFile[] attachments) throws IOException {

        var attachmentMap = new HashMap<String, byte[]>();
        if (attachments != null) {
            for (var file : attachments) {
                if (file.getOriginalFilename() != null) {
                    attachmentMap.put(file.getOriginalFilename(), file.getBytes());
                }
            }
        }

        emailService.sendEmailWithAttachment(recipient, subject, body, cc, bcc, replyTo, isHtml, attachmentMap);
        return ResponseEntity.ok("Email with attachments sent successfully.");
    }

    @PostMapping("/schedule")
    public ResponseEntity<String> scheduleEmail(
            @RequestParam @Email String recipient,
            @RequestParam @NotBlank @Size(max = 100) String subject,
            @RequestParam @NotBlank @Size(max = 1000) String body,
            @RequestParam(required = false) List<@Email String> cc,
            @RequestParam(required = false) List<@Email String> bcc,
            @RequestParam(required = false) @Email String replyTo,
            @RequestParam(defaultValue = "false") boolean isHtml,
            @RequestParam @Future(message = "Scheduled time must be in the future") Instant sendTime) {

        emailService.scheduleEmail(recipient, subject, body, cc, bcc, replyTo, isHtml, sendTime);
        return ResponseEntity.ok("Email scheduled successfully.");
    }
}