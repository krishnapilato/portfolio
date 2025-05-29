package com.personal.portfolio.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class LandingPageController {

    @Autowired
    private HealthEndpoint healthEndpoint;

    @GetMapping
    public String landingPage(Model model) {
        model.addAttribute("overallStatus", healthEndpoint.health().getStatus().getCode());
        return "portfolioLanding";
    }
}