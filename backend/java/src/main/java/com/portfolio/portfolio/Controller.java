package com.portfolio.portfolio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class Controller {

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestBody Map<String, String> emailData) {

        String to = emailData.get("to");
        String subject = emailData.get("subject");
        String message = emailData.get("body");

        // You can add your email sending logic here

        return ResponseEntity.ok("Email sent successfully!");
    }
}