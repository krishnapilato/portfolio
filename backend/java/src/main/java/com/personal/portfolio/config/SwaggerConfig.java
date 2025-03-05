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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.stream.Stream;

/**
 * Configures Swagger and OpenAPI documentation.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://prismnexus-backend.eu-south-1.elasticbeanstalk.com")
                                .description("Production Server (Accessible only via AWS Client VPN)")
                ))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    private Info apiInfo() {
        return new Info()
                .title("PrismNexus Backend API")
                .version("v0.8.5")
                .description("""
                        The PrismNexus Backend provides secure authentication,
                        user management, and email functionalities.
                        """)
                .contact(new Contact()
                        .name("Khova Krishna Pilato")
                        .url("https://krishnapilato.github.io/kodek")
                        .email("krishnak.pilato@gmail.com"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    @Bean
    public List<GroupedOpenApi> groupedApis() {
        return Stream.of(
                        new String[][]{
                                {"Authentication", "/auth/**"},
                                {"User", "/api/users/**"},
                                {"Email", "/api/email/**"}
                        })
                .map(group -> GroupedOpenApi.builder().group(group[0]).pathsToMatch(group[1]).build())
                .toList();
    }
}