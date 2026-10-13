package com.personal.portfolio.platform;

import module java.base;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
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

    private static final String DESCRIPTION = """
        A Spring Boot base for new projects: accounts, sign-in and transactional email.

        **Getting started**
        1. Register with `POST /api/v1/auth/register`, then confirm the address with the token sent by email.
        2. Sign in with `POST /api/v1/auth/login` to receive an access token and a refresh token.
        3. Click **Authorize** and paste the access token to call the protected endpoints.
        4. When the access token expires, exchange the refresh token at `POST /api/v1/auth/refresh`.

        **Access**
        - `Authentication`: public and rate limited per client address.
        - `Account`: any signed-in user.
        - `Users` and `Mail`: administrators only.

        **Conventions**
        - Errors are returned as RFC 9457 problem details (`application/problem+json`).
        - Every response carries an `X-Request-Id` header; quote it when reporting a problem.
        - Refresh tokens are single use: each refresh returns a new one, and replaying an old one signs the session out.
        - Mail is queued in an outbox and delivered in the background with retries.
        """;

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
        var version = Optional.ofNullable(buildProperties.getIfAvailable()).map(BuildProperties::getVersion).orElse("dev");
        return new OpenAPI()
            .info(new Info()
                .title("Portfolio Platform API")
                .version(version)
                .description(DESCRIPTION)
                .contact(new Contact().name("Khova Krishna Pilato").url("https://krishnapilato.github.io/portfolio"))
                .license(new License().name("MIT").url("https://opensource.org/license/mit")))
            .servers(List.of(new Server().url("/").description("The server that served this page")))
            .components(new Components()
                .addSecuritySchemes(BEARER_JWT, new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Access token returned by `POST /api/v1/auth/login` or `POST /api/v1/auth/refresh`.")))
            .addSecurityItem(new SecurityRequirement().addList(BEARER_JWT));
    }
}
