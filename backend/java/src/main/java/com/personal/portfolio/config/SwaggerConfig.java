package com.personal.portfolio.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {
	@Bean
	public OpenAPI customOpenAPI() {
		String schemeName = "bearerAuth";
		String bearerFormat = "JWT";
		String scheme = "bearer";

		return new OpenAPI().addSecurityItem(new SecurityRequirement().addList(schemeName))
				.components(new Components().addSecuritySchemes(schemeName,
						new SecurityScheme().name(schemeName).type(SecurityScheme.Type.HTTP).scheme(scheme)
								.bearerFormat(bearerFormat)))
				.info(new Info().title("Portfolio").description("REST API Showcase").version("0.0.1"));
	}

	@Bean
	public GroupedOpenApi authApi() {
		return GroupedOpenApi.builder().group("Authentication & Authorization")
				.packagesToScan("com.personal.portfolio.controller").pathsToMatch("/auth/**").build();
	}
}