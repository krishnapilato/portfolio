package com.personal.portfolio.platform;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
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

    // Ticks in whole microseconds, the precision of DATETIME(6): an instant then reads back from the database
    // exactly as written, instead of being rounded half a microsecond into the future.
    @Bean
    Clock clock() {
        return Clock.tick(Clock.systemUTC(), Duration.ofNanos(1_000));
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
                        .description("A Spring Boot base for new projects: accounts, sign-in and transactional email")
                        .contact(new Contact()
                                .name("Khova Krishna Pilato")
                                .url("https://krishnapilato.github.io/portfolio"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/license/mit")))
                // Relative, so "Try it out" calls whatever origin served the page, proxy or not.
                .servers(List.of(new Server().url("/")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_JWT, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_JWT));
    }
}
