package com.example.core.security;

import module java.base;

import com.example.core.CoreProperties;
import com.example.core.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.actuate.info.InfoEndpoint;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/// Every service trusts the same identity provider: a request is authenticated by the provider's signature on
/// its access token, and its roles are the realm roles the provider put in it.
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
public class SecurityConfiguration {

    public static final String ADMIN = "admin";

    private static final List<String> PAGES = List.of("/", "/error", "/assets/**", "/demo/**", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**");

    private static final Duration HSTS_MAX_AGE = Duration.ofDays(365);
    private static final Duration CORS_MAX_AGE = Duration.ofHours(1);
    private static final String PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=()";

    // An API client gets the Bearer challenge; a browser gets it too, with the error page instead of an empty body.
    private static AuthenticationEntryPoint challenge() {
        var bearer = new BearerTokenAuthenticationEntryPoint();
        var browser = new MediaTypeRequestMatcher(MediaType.TEXT_HTML);
        browser.setIgnoredMediaTypes(Set.of(MediaType.ALL));
        return (request, response, exception) -> {
            bearer.commence(request, response, exception);
            if (browser.matches(request)) response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        };
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, CoreProperties properties) {
        var roles = new JwtAuthenticationConverter();
        roles.setJwtGrantedAuthoritiesConverter(new RealmRoles());
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(requests -> requests
                .requestMatchers(Stream.concat(PAGES.stream(), properties.security().publicPaths().stream()).toArray(String[]::new)).permitAll()
                .requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class)).permitAll()
                .requestMatchers(EndpointRequest.toAnyEndpoint()).hasRole(ADMIN)
                .anyRequest().authenticated())
            .oauth2ResourceServer(server -> server.jwt(jwt -> jwt.jwtAuthenticationConverter(roles)).authenticationEntryPoint(challenge()))
            .headers(headers -> headers
                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(HSTS_MAX_AGE.toSeconds()))
                // Same origin only: nothing leaks to other sites, and the browser still names this one on its own form posts.
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicy.SAME_ORIGIN))
                .permissionsPolicyHeader(permissions -> permissions.policy(PERMISSIONS_POLICY))
                .frameOptions(FrameOptionsConfig::deny))
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(CoreProperties properties) {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(properties.cors().allowedOrigins());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE, RequestIdFilter.HEADER));
        cors.setExposedHeaders(List.of(RequestIdFilter.HEADER, HttpHeaders.LOCATION, HttpHeaders.RETRY_AFTER));
        cors.setMaxAge(CORS_MAX_AGE);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
