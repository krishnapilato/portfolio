package com.personal.portfolio.config;

import java.util.List;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class SwaggerConfig {

	private static final String BEARER_AUTH = "bearerAuth";

	@Bean
	public OpenAPI openAPI() {
		Contact contact = new Contact();
		contact.setName("Khova Krishna Pilato");
		contact.setUrl("https://khovakrishnapilato.com");
		contact.setEmail("krishnak.pilato@gmail.com");

		Server server = new Server();
		server.setUrl("http://localhost:8080");
		server.setDescription("Development");

		return new OpenAPI().addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
				.components(new Components().addSecuritySchemes(BEARER_AUTH,
						new SecurityScheme().name(BEARER_AUTH).type(SecurityScheme.Type.HTTP).scheme("bearer")
								.bearerFormat("JWT")))
				.info(new Info().title("Portfolio Website API")
						.description("REST API Documentation for my Portfolio Website").version("0.0.1-SNAPSHOT")
						.contact(contact))
				.servers(List.of(server))
				.externalDocs(new ExternalDocumentation().description("Find out more about Swagger UI")
						.url("https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration"))
				.externalDocs(new ExternalDocumentation().description("GitHub Repository")
						.url("https://github.com/krishnapilato/portfolio/tree/dev/backend/java"));
	}

	@Bean
	public GroupedOpenApi authApi() {
		return GroupedOpenApi.builder().group("Authentication & Authorization")
				.packagesToScan("com.personal.portfolio.controller").pathsToMatch("/auth/**").build();
	}

	@Bean
	public GroupedOpenApi userApi() {
		return GroupedOpenApi.builder().group("User").packagesToScan("com.personal.portfolio.controller")
				.pathsToMatch("/api/users/**").build();
	}
}