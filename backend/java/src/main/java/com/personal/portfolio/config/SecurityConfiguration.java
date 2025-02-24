package com.personal.portfolio.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security configuration for the application.
 * Configures HTTP security, CORS settings, and authentication.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/auth/**",
            "/api/email/**"
    );

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configures the security filter chain.
     *
     * @param http HttpSecurity instance
     * @return Configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Convert the list of public endpoints to an array for use in requestMatchers.
        String[] publicEndpoints = PUBLIC_ENDPOINTS.toArray(String[]::new);

        return http
                // Enable CORS using a custom configuration source.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Disable CSRF protection as JWT-based authentication is stateless.
                .csrf(AbstractHttpConfigurer::disable)
                // Set session management to stateless.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configure authorization rules:
                // - Permit all requests to public endpoints.
                // - Require authentication for all other endpoints.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(publicEndpoints).permitAll()
                        .anyRequest().authenticated())
                // Add the JWT authentication filter before the UsernamePasswordAuthenticationFilter.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS).
     *
     * @return CorsConfigurationSource with allowed origins, methods, and headers
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of( // Allowed origins (adjust as needed)
                "http://localhost:4200",
                "https://prismnexus-backend.eu-south-1.elasticbeanstalk.com"
        ));
        configuration.setAllowedMethods(List.of( // Allowed HTTP methods
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()
        ));
        configuration.setAllowedHeaders(List.of( // Allowed headers
                "Authorization",
                "Content-Type"
        ));
        configuration.setAllowCredentials(true); // Allow credentials (cookies, auth headers)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}