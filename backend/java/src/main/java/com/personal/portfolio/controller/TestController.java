package com.personal.portfolio.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class TestController {

    @GetMapping("/hello")
    public String sendEmail() {
        return "Hello";
    }
}