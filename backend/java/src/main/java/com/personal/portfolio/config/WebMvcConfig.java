package com.personal.portfolio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration for customizing request mappings and view controllers.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	/**
	 * Configures view controllers to handle specific mappings.
	 *
	 * @param registry the registry for view controllers
	 */
	@Override
	public void addViewControllers(ViewControllerRegistry registry) {
		// Redirect the root URL ("/") to the Swagger UI index page
		registry.addRedirectViewController("/", "/swagger-ui/index.html")
				.setStatusCode(HttpStatus.FOUND);

		// Redirect any unknown URL path to the Swagger UI index page
		registry.addRedirectViewController("/{path:[^\\.]*}", "/swagger-ui/index.html")
				.setStatusCode(HttpStatus.FOUND);
	}
}