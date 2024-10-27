package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class Controller {

    @Autowired
    private JavaMailSender mailSender;

    private final UserRepository userRepository;

    public Controller(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestBody Map<String, String> emailData) {

        String to = emailData.get("to");
        String subject = emailData.get("subject");
        String message = emailData.get("body");

        userRepository.findAll();

        // You can add your email sending logic here

        return ResponseEntity.ok("Email sent!");
    }
}