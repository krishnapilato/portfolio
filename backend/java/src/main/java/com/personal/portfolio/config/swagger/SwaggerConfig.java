package com.personal.portfolio.config.swagger;

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
import org.springframework.core.env.Profiles;

import java.util.ArrayList;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI(
            Environment environment,
            @Value("${spring.application.version:1.0.0}") String projectVersion) {

        var servers = new ArrayList<Server>();

        if (environment.acceptsProfiles(Profiles.of("dev"))) {
            servers.add(new Server()
                    .url("http://localhost:8080")
                    .description("Local Development"));
        }

        servers.add(new Server()
                .url("https://khovakrishnapilato-backend.eu-south-1.elasticbeanstalk.com")
                .description("Production Environment"));

        var securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Provide the JWT token obtained after authentication");

        var info = new Info()
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

        return new OpenAPI()
                .info(info)
                .servers(servers)
                .components(new Components().addSecuritySchemes("bearerAuth", securityScheme))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("01-Authentication")
                .pathsToMatch("/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("02-User")
                .pathsToMatch("/api/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi emailApi() {
        return GroupedOpenApi.builder()
                .group("03-Email")
                .pathsToMatch("/api/email/**")
                .build();
    }
}