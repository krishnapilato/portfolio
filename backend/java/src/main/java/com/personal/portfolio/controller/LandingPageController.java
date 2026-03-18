package com.personal.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LandingPageController {

    @GetMapping("/")
    public String landingPage(Model model) {
        model.addAttribute("overallStatus", "UP");
        return "portfolioLanding";
    }
}