package com.personal.portfolio.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for application-wide authentication and security settings.
 * Defines beans for user details, password encoding, and authentication mechanisms.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfiguration {

    /**
     * Provides a globally accessible PasswordEncoder for Spring Security
     *
     * @param strength the strength for BCrypt encoding
     * @return a BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder(@Value("${bcrypt.strength:15}") int strength) {
        return new BCryptPasswordEncoder(strength);
    }

    /**
     * Configures the {@link AuthenticationManager} to handle authentication logic.
     *
     * @param config the authentication configuration.
     * @return the configured AuthenticationManager.
     * @throws Exception if there are issues with configuring the manager.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}