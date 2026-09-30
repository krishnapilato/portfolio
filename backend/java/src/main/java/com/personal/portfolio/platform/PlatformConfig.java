package com.personal.portfolio.platform;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import java.time.Clock;
import java.util.Optional;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.actuate.audit.InMemoryAuditEventRepository;
import org.springframework.boot.actuate.web.exchanges.InMemoryHttpExchangeRepository;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.accept.ApiVersionResolver;
import org.springframework.web.accept.PathApiVersionResolver;

@Configuration(proxyBeanMethods = false)
class PlatformConfig {

    private static final String BEARER_JWT = "bearer-jwt";

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    InMemoryHttpExchangeRepository httpExchangeRepository() {
        var repository = new InMemoryHttpExchangeRepository();
        repository.setCapacity(200);
        return repository;
    }

    @Bean
    InMemoryAuditEventRepository auditEventRepository() {
        return new InMemoryAuditEventRepository(1000);
    }

    @Bean
    ApiVersionResolver apiVersionResolver() {
        return new PathApiVersionResolver(1, path -> path.pathWithinApplication().value().startsWith("/api/"));
    }

    @Bean
    OpenAPI openApi(ObjectProvider<BuildProperties> buildProperties) {
        var version = Optional.ofNullable(buildProperties.getIfAvailable())
                .map(BuildProperties::getVersion)
                .orElse("dev");
        return new OpenAPI()
                .info(new Info()
                        .title("Portfolio Platform API")
                        .version(version)
                        .description("Authentication, user management and transactional email for "
                                + "krishnapilato.github.io")
                        .contact(new Contact()
                                .name("Khova Krishna Pilato")
                                .url("https://krishnapilato.github.io/portfolio"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/license/mit")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_JWT, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_JWT));
    }
}
