package com.personal.portfolio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.personal.portfolio.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Configuration class for application-wide authentication and security settings.
 * Defines beans for user details, password encoding, and authentication mechanisms.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfiguration {

	private final UserRepository userRepository;

	/**
	 * Configures the {@link UserDetailsService} to fetch user details from the database
	 * based on the provided username (email).
	 *
	 * @return a custom {@link UserDetailsService} implementation.
	 */
	@Bean
	public UserDetailsService userDetailsService() {
		return username -> userRepository.findByEmail(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
	}

	/**
	 * Configures the password encoder to use the BCrypt hashing algorithm with a strength of 12.
	 *
	 * @return a {@link BCryptPasswordEncoder} instance.
	 */
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(15);
	}

	/**
	 * Provides the {@link AuthenticationManager}, which manages authentication operations
	 * for the application. The configuration is derived from the provided {@link AuthenticationConfiguration}.
	 *
	 * @param config the authentication configuration.
	 * @return the {@link AuthenticationManager}.
	 * @throws Exception if the authentication manager cannot be created.
	 */
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	/**
	 * Configures the {@link AuthenticationProvider} to handle authentication requests.
	 * Uses the {@link DaoAuthenticationProvider} to integrate user details and password encoding.
	 *
	 * @return the {@link AuthenticationProvider}.
	 */
	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService());
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}
}