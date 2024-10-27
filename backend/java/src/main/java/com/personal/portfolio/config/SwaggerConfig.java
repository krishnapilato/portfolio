package com.personal.portfolio.config;

import java.util.Arrays;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
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

	@Value("${openapi.contact.name}")
	private String contactName;

	@Value("${openapi.contact.url}")
	private String contactUrl;

	@Value("${openapi.contact.email}")
	private String contactEmail;

	@Value("${openapi.server.url}")
	private String serverUrl;

	@Value("${openapi.server.description}")
	private String serverDescription;

	@Value("${openapi.info.title}")
	private String apiTitle;

	@Value("${openapi.info.description}")
	private String apiDescription;

	@Value("${openapi.info.version}")
	private String apiVersion;

	@Value("${openapi.external.docs.swagger.url}")
	private String swaggerUrl;

	@Value("${openapi.external.docs.github.url}")
	private String githubUrl;

	@Bean
	public OpenAPI openAPI() {
		Contact contact = new Contact()
				.name(contactName)
				.url(contactUrl)
				.email(contactEmail);

		Server server = new Server()
				.url(serverUrl)
				.description(serverDescription);

		return new OpenAPI()
				.addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
				.components(new Components().addSecuritySchemes("BearerAuth",
						new SecurityScheme()
								.name("BearerAuth")
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")))
				.info(new Info()
						.title(apiTitle)
						.description(apiDescription)
						.version(apiVersion)
						.contact(contact))
				.servers(Arrays.asList(server))
				.externalDocs(new ExternalDocumentation()
						.description("Find out more about Swagger UI")
						.url(swaggerUrl))
				.externalDocs(new ExternalDocumentation()
						.description("GitHub Repository")
						.url(githubUrl));
	}

	@Bean
	public GroupedOpenApi authApi() {
		return createGroupedOpenApi("Authentication & Authorization", "/auth/**");
	}

	@Bean
	public GroupedOpenApi userApi() {
		return createGroupedOpenApi("User", "/api/users/**");
	}

	@Bean
	public GroupedOpenApi emailApi() {
		return createGroupedOpenApi("Email", "/api/email/**");
	}

	private GroupedOpenApi createGroupedOpenApi(String groupName, String pathPattern) {
		return GroupedOpenApi.builder()
				.group(groupName)
				.packagesToScan("com.personal.portfolio.controller")
				.pathsToMatch(pathPattern)
				.build();
	}
}