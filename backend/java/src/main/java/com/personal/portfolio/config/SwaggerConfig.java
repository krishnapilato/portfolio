package com.personal.portfolio.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
        return new OpenAPI().info(new Info().title("PrismNexus Backend API").version("v0.8.5d").description("""
                        The PrismNexus Backend API is the core service powering the PrismNexus platform. It provides robust and secure endpoints for:
                        
                        - User management: Create, update, and delete user accounts.
                        - Authentication: Secure login, JWT token generation, and password management.
                        - Role-based access control: Assign and manage roles for users.
                        - Email notifications: Easily send email notifications for various events.
                        
                        **Key Features**:
                        - RESTful APIs with full CRUD functionality for user data.
                        - Authentication with JWT tokens for secure communication.
                        - Admin dashboard for managing user roles and privileges.
                        
                        The API supports both local and production environments, ensuring seamless integration with the frontend application.
                        """).contact(new Contact().name("Krishna Pilato").url("https://krishnapilato.github.io/kodek").email("krishnak.pilato@gmail.com")).license(new License().name("MIT License").url("https://opensource.org/licenses/MIT"))).addServersItem(new io.swagger.v3.oas.models.servers.Server().url("http://localhost:8080").description("Local Development Server")).addServersItem(new io.swagger.v3.oas.models.servers.Server().url("https://backend.prismnexus.com").description("Production Server"))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"))).addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    /**
     * Groups API endpoints related to authentication and authorization.
     *
     * @return a {@link GroupedOpenApi} instance for authentication and authorization APIs.
     */
    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder().group("Authentication").pathsToMatch("/auth/**").build();
    }

    /**
     * Groups API endpoints related to user management.
     *
     * @return a {@link GroupedOpenApi} instance for user-related APIs.
     */
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder().group("User").pathsToMatch("/api/users/**").build();
    }

    /**
     * Groups API endpoints related to email functionality.
     *
     * @return a {@link GroupedOpenApi} instance for email-related APIs.
     */
    @Bean
    public GroupedOpenApi emailApi() {
        return GroupedOpenApi.builder().group("Email").pathsToMatch("/api/email/**").build();
    }
}