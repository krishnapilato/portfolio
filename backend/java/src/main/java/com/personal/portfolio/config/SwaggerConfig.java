package com.personal.portfolio.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.ArrayList;
import java.util.List;

/**
 * Configures Swagger and OpenAPI documentation.
 */
@Configuration
public class SwaggerConfig {

    private Environment environment;

    @Value("${spring.application.version}")
    private String projectVersion;

    SwaggerConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(apiServers())
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Provide the JWT token obtained after authentication")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    private Info apiInfo() {
        return new Info()
                .title("Backend API")
                .version(projectVersion)
                .description("""
                        This Backend provides secure authentication,
                        user management, and email functionalities.
                        """)
                .contact(new Contact()
                        .name("Khova Krishna Pilato")
                        .url("https://krishnapilato.github.io/portfolio")
                        .email("krishnak.pilato@gmail.com"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    private List<Server> apiServers() {
        List<Server> servers = new ArrayList<>();
        if (environment.matchesProfiles("dev")) {
            servers.add(new Server().url("http://localhost:8080"));
        }
        servers.add(new Server().url("https://khovakrishnapilato-backend.eu-south-1.elasticbeanstalk.com"));
        return servers;
    }

    @Bean
    public List<GroupedOpenApi> groupedApis() {
        return List.of(
                GroupedOpenApi.builder()
                        .group("01-Authentication")
                        .pathsToMatch("/auth/**")
                        .build(),
                GroupedOpenApi.builder()
                        .group("02-User")
                        .pathsToMatch("/api/users/**")
                        .build(),
                GroupedOpenApi.builder()
                        .group("03-Email")
                        .pathsToMatch("/api/email/**")
                        .build()
        );
    }
}