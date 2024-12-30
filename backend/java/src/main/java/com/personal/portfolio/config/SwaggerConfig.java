package com.personal.portfolio.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

/**
 * Configuration class for setting up Swagger and OpenAPI documentation.
 * Provides metadata and organizes API endpoints into groups for better navigation in the documentation.
 */
@Configuration
public class SwaggerConfig {

	/**
	 * Configures the OpenAPI metadata for the application.
	 *
	 * @return an {@link OpenAPI} object containing metadata such as title, version, contact, and license information.
	 */
	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Portfolio API")
						.version("v0.8.5")
						.description("""
                            This API powers the Portfolio application, offering a comprehensive
                            set of endpoints for user management, authentication, and more.
                            
                            Key Highlights:
                            - Secure and robust authentication mechanisms
                            - User and role management features
                            - Email notification support
                            
                            Explore the documentation to understand available endpoints and their usage.
                            """)
						.contact(new Contact()
								.name("Krishna")
								.url("https://krishnapilato.github.io/portfolio")
								.email("krishnak.pilato@gmail.com"))
						.license(new License()
								.name("MIT License")
								.url("https://opensource.org/licenses/MIT")))
				.addServersItem(new io.swagger.v3.oas.models.servers.Server()
						.url("http://krishnapilato-portfolio-api.us-east-1.elasticbeanstalk.com")
						.description("Production Server"))
				.addServersItem(new io.swagger.v3.oas.models.servers.Server()
						.url("http://localhost:8080")
						.description("Local Development Server"));
	}

	/**
	 * Groups API endpoints related to authentication and authorization.
	 *
	 * @return a {@link GroupedOpenApi} instance for authentication and authorization APIs.
	 */
	@Bean
	public GroupedOpenApi authApi() {
		return GroupedOpenApi.builder()
				.group("Authentication & Authorization")
				.pathsToMatch("/auth/**")
				.build();
	}

	/**
	 * Groups API endpoints related to user management.
	 *
	 * @return a {@link GroupedOpenApi} instance for user-related APIs.
	 */
	@Bean
	public GroupedOpenApi userApi() {
		return GroupedOpenApi.builder()
				.group("User")
				.pathsToMatch("/api/users/**")
				.build();
	}

	/**
	 * Groups API endpoints related to email functionality.
	 *
	 * @return a {@link GroupedOpenApi} instance for email-related APIs.
	 */
	@Bean
	public GroupedOpenApi emailApi() {
		return GroupedOpenApi.builder()
				.group("Email")
				.pathsToMatch("/api/email/**")
				.build();
	}
}