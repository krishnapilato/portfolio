package com.personal.portfolio.security;

import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.CorrelationFilter;
import com.personal.portfolio.platform.KeyRing;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.boot.actuate.info.InfoEndpoint;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtAudienceValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
class SecurityConfig {

    private static final String ADMIN = Role.ADMIN.name();
    private static final String METRICS = "METRICS";
    private static final String SCRAPER = "prometheus";
    private static final RequestMatcher AUTH_ENDPOINTS =
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/api/*/auth/**");
    private static final Duration HSTS_MAX_AGE = Duration.ofDays(365);
    private static final Duration CORS_MAX_AGE = Duration.ofHours(1);
    private static final String PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=()";
    private static final String CONTENT_SECURITY_POLICY = String.join("; ",
            "default-src 'self'",
            "script-src 'self' https://cdnjs.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
            "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
            "img-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'");

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    SecurityFilterChain scrapeFilterChain(HttpSecurity http, AppProperties properties, PasswordEncoder passwordEncoder,
            Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter) {
        return http
                .securityMatcher(EndpointRequest.to("prometheus"))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests.anyRequest().hasAnyRole(METRICS, ADMIN))
                .userDetailsService(scrapers(properties.security().scrapePassword(), passwordEncoder))
                .httpBasic(Customizer.withDefaults())
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint()))
                .build();
    }

    static UserDetailsService scrapers(String password, PasswordEncoder passwordEncoder) {
        var scrapers = new InMemoryUserDetailsManager();
        if (!password.isBlank()) {
            scrapers.createUser(User.withUsername(SCRAPER)
                    .password(Objects.requireNonNull(passwordEncoder.encode(password)))
                    .roles(METRICS)
                    .build());
        }
        return scrapers;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
            Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter) {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/", "/error", "/favicon.svg", "/favicon.ico", "/assets/**", "/system/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**", "/v3/api-docs/**", "/.well-known/**").permitAll()
                        .requestMatchers(EndpointRequest.toLinks(),
                                EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class)).permitAll()
                        .requestMatchers(AUTH_ENDPOINTS).permitAll()
                        .requestMatchers("/api/*/users/**", "/api/*/mail/**").hasRole(ADMIN)
                        .requestMatchers(EndpointRequest.toAnyEndpoint()).hasRole(ADMIN)
                        .anyRequest().authenticated())
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .bearerTokenResolver(ignoringAuthEndpoints())
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint(bearerChallenge())
                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler()))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives(CONTENT_SECURITY_POLICY))
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(HSTS_MAX_AGE.toSeconds()))
                        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicyHeader(permissions -> permissions.policy(PERMISSIONS_POLICY))
                        .frameOptions(FrameOptionsConfig::deny))
                .build();
    }

    private static BearerTokenResolver ignoringAuthEndpoints() {
        var header = new DefaultBearerTokenResolver();
        return request -> AUTH_ENDPOINTS.matches(request) ? null : header.resolve(request);
    }

    private static AuthenticationEntryPoint bearerChallenge() {
        var bearer = new BearerTokenAuthenticationEntryPoint();
        var browser = new MediaTypeRequestMatcher(MediaType.TEXT_HTML);
        browser.setIgnoredMediaTypes(Set.of(MediaType.ALL));
        return (request, response, exception) -> {
            bearer.commence(request, response, exception);
            if (browser.matches(request)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            }
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        var encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        if (encoder instanceof DelegatingPasswordEncoder delegating) {
            delegating.setDefaultPasswordEncoderForMatches(new BCryptPasswordEncoder());
        }
        return encoder;
    }

    @Bean
    JwtEncoder jwtEncoder(KeyRing keyRing) {
        return NimbusJwtEncoder.withSecretKey(keyRing.signingKey()).algorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    JwtDecoder jwtDecoder(KeyRing keyRing, AppProperties properties, Clock clock) {
        var security = properties.security();
        var freshness = new JwtTimestampValidator();
        freshness.setClock(clock);
        var decoder = NimbusJwtDecoder.withSecretKey(keyRing.signingKey()).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithValidators(List.of(
                freshness,
                new JwtIssuerValidator(security.issuer()),
                new JwtAudienceValidator(security.audience()))));
        return decoder;
    }

    @Bean
    Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter(UserRepository users) {
        return jwt -> users.findById(AccessTokens.userId(jwt))
                .filter(user -> user.getStatus() == AccountStatus.ACTIVE)
                .map(user -> new JwtAuthenticationToken(jwt,
                        AuthorityUtils.createAuthorityList("ROLE_" + user.getRole().name()), jwt.getSubject()))
                .orElseThrow(() -> new InvalidBearerTokenException("The account is no longer active"));
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties properties) {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(properties.cors().allowedOrigins());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE, CorrelationFilter.HEADER));
        cors.setExposedHeaders(List.of(CorrelationFilter.HEADER, HttpHeaders.LOCATION, HttpHeaders.RETRY_AFTER));
        cors.setAllowCredentials(false);
        cors.setMaxAge(CORS_MAX_AGE);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
