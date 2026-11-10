package com.example.core;

import module java.base;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/// Adding the core to a service's dependencies is the whole setup: Spring Boot finds this class through
/// `META-INF/spring`, whatever package the service lives in.
@AutoConfiguration
@ComponentScan
@EnableConfigurationProperties(CoreProperties.class)
public class CoreConfiguration implements WebMvcConfigurer {

    private static final String BEARER_JWT = "bearer-jwt";

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    OpenAPI openApi(CoreProperties properties) {
        return new OpenAPI()
            .info(new Info()
                .title(properties.name())
                .description(properties.description())
                .license(new License().name("MIT").url("https://opensource.org/license/mit")))
            .components(new Components().addSecuritySchemes(BEARER_JWT, new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Access token issued by the identity provider.")))
            .addSecurityItem(new SecurityRequirement().addList(BEARER_JWT));
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }
}
