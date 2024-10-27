package com.personal.portfolio.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {

    @GetMapping("/")
    public String sendEmail() {
        return "Hello";
    }
}