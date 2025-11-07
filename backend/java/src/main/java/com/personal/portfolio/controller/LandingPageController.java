package com.personal.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class LandingPageController {

    @GetMapping
    public String landingPage(Model model) {
        // Set a default UP status since health endpoint access has changed in Spring Boot 4
        // For actual health checks, use the /actuator/health endpoint directly
        model.addAttribute("overallStatus", "UP");
        return "portfolioLanding";
    }
}