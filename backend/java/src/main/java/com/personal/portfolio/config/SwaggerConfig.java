package com.personal.portfolio.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {
	@Bean
	public OpenAPI openAPI() {
		return new OpenAPI().addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
				.components(new Components().addSecuritySchemes("bearerAuth",
						new SecurityScheme().name("bearerAuth").type(SecurityScheme.Type.HTTP).scheme("bearer")
								.bearerFormat("JWT")))
				.info(new Info().title("khovakrishnapilato.com").description("REST API Documentation").version("0.0.1"))
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