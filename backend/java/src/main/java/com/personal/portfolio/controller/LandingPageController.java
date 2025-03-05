package com.personal.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller for handling landing page requests.
 */
@Controller
@RequestMapping("/")
public class LandingPageController {

    /**
     * Handles the root URL request and renders the landing page.
     */
    @GetMapping
    public String landingPage(Model model) {
        model.addAttribute("message", "Work in Progress!");
        return "portfolioLanding";
    }
}