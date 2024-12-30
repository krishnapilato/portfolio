package com.personal.portfolio.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Web MVC Configuration for handling request mappings and view rendering.
 */
@Controller
public class WebMvcConfig {

	/**
	 * Handles the root URL ("/") request and populates the model with portfolio details.
	 *
	 * @return the name of the Thymeleaf template to render
	 */
	@GetMapping("/")
	public String landingPage() {
		return "portfolioLanding";
	}
}