package com.personal.portfolio.config;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Web MVC configuration for handling root URL requests and rendering the landing page view.
 */
@Controller
public class WebMvcConfig {

    /**
     * Handles the root URL ("/") request.
     *
     * @param model the Model object to pass attributes to the view
     * @return the name of the Thymeleaf template to render
     */
    @GetMapping("/")
    public String landingPage(Model model) {
        model.addAttribute("message", "Work in Progress!");
        return "portfolioLanding";
    }
}