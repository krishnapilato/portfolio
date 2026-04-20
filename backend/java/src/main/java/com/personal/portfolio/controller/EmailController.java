package com.personal.portfolio.controller;

import com.personal.portfolio.service.EmailService;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

@Validated
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

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
