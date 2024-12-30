package com.personal.portfolio.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

/**
 * Security configuration for the application.
 * Configures HTTP security, CORS settings, and authentication.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

	// Whitelisted endpoints accessible without authentication
	private static final String[] API_WHITELIST = {
			"/",                          // Root path
			"/v3/api-docs/**",            // OpenAPI documentation
			"/swagger-ui/**",             // Swagger UI
			"/auth/**",                   // Authentication endpoints
			"/api/email/send"             // Public email sending endpoint
	};

	// Dependencies for authentication and JWT filtering
	private final AuthenticationProvider authenticationProvider;
	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	/**
	 * Configures the security filter chain.
	 *
	 * @param http HttpSecurity to configure the application security
	 * @return Configured SecurityFilterChain
	 * @throws Exception if an error occurs during configuration
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				// Enable CORS with custom configuration
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// Disable CSRF as JWT is used for authentication
				.csrf(AbstractHttpConfigurer::disable)

				// Configure endpoint authorization
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(API_WHITELIST).permitAll() // Allow access to whitelisted endpoints
						.anyRequest().authenticated()               // Require authentication for all other requests
				)

				// Set session management to stateless
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// Set custom authentication provider
				.authenticationProvider(authenticationProvider)

				// Add JWT filter before the username/password authentication filter
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	/**
	 * Configures Cross-Origin Resource Sharing (CORS) for the application.
	 *
	 * @return CorsConfigurationSource with allowed origins, methods, and headers
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// Allowed origins for cross-origin requests
		configuration.setAllowedOrigins(List.of(
				"http://localhost:4200",
				"http://my-portfolio-frontend-khovakrishna.s3-website-us-east-1.amazonaws.com"
		));

		// Allowed HTTP methods
		configuration.setAllowedMethods(List.of(
				HttpMethod.GET.name(),
				HttpMethod.POST.name(),
				HttpMethod.PUT.name(),
				HttpMethod.DELETE.name(),
				HttpMethod.OPTIONS.name()
		));

		// Allowed headers for requests
		configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

		// Allow credentials such as cookies or Authorization headers
		configuration.setAllowCredentials(true);

		// Apply the CORS configuration to all paths
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);

		return source;
	}
}