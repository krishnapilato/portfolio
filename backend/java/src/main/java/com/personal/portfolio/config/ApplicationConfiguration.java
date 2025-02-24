package com.personal.portfolio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for application-wide authentication and security settings.
 * Defines beans for password encoding and authentication mechanisms.
 */
@Configuration
public class ApplicationConfiguration {

    /**
     * Creates a PasswordEncoder bean using BCrypt with a configurable strength.
     *
     * @param strength the BCrypt encoding strength, defaulting to 15 if not set.
     * @return a BCryptPasswordEncoder instance.
     */
    @Bean
    public PasswordEncoder passwordEncoder(@Value("${bcrypt.strength:15}") int strength) {
        return new BCryptPasswordEncoder(strength);
    }

    /**
     * Configures and exposes the AuthenticationManager bean.
     *
     * @param config the AuthenticationConfiguration.
     * @return the configured AuthenticationManager.
     * @throws Exception if an error occurs during configuration.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}