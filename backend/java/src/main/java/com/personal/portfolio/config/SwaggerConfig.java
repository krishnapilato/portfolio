package com.personal.portfolio.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configures Swagger and OpenAPI documentation.
 * Provides metadata and organizes API endpoints into logical groups.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(apiServers())
                .components(securityComponents())
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    private Info apiInfo() {
        return new Info()
                .title("PrismNexus Backend API")
                .version("v0.8.5")
                .description("""
                        The PrismNexus Backend provides secure authentication,
                        user management, and email functionalities. It supports both local and production environments.
                        """)
                .contact(apiContact())
                .license(apiLicense());
    }

    private Contact apiContact() {
        return new Contact()
                .name("Krishna Pilato")
                .url("https://krishnapilato.github.io/kodek")
                .email("krishnak.pilato@gmail.com");
    }

    private License apiLicense() {
        return new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");
    }

    private List<Server> apiServers() {
        return List.of(
                createServer("http://localhost:8080", "Local Development Server"),
                createServer("https://prismnexus-backend.eu-south-1.elasticbeanstalk.com",
                        "Production Server (Accessible only via AWS Client VPN)")
        );
    }

    private Server createServer(String url, String description) {
        return new Server().url(url).description(description);
    }

    private Components securityComponents() {
        return new Components().addSecuritySchemes("bearerAuth",
                new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }

    @Bean
    public List<GroupedOpenApi> groupedApis() {
        return List.of(
                createGroupedOpenApi("Authentication", "/auth/**"),
                createGroupedOpenApi("User", "/api/users/**"),
                createGroupedOpenApi("Email", "/api/email/**")
        );
    }

    private GroupedOpenApi createGroupedOpenApi(String group, String path) {
        return GroupedOpenApi.builder().group(group).pathsToMatch(path).build();
    }
}