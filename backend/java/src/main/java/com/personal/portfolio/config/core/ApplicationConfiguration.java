package com.personal.portfolio.config.core;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Central configuration for security.
 * Defines {@link PasswordEncoder} using BCrypt strength.
 * Defines {@link AuthenticationManager} bean for use in security flows.
 */
@Configuration
@EnableConfigurationProperties(BcryptProperties.class)
public class ApplicationConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfiguration.class);
    private final BcryptProperties bcryptProperties;

    public ApplicationConfiguration(BcryptProperties bcryptProperties) {
        this.bcryptProperties = bcryptProperties;
    }

    /**
     * Validates the configured bcrypt strength after properties are loaded.
     */
    @PostConstruct
    public void validateBcryptStrength() {
        int strength = bcryptProperties.getStrength();
        if (strength < 4 || strength > 31) {
            throw new IllegalArgumentException("bcrypt.strength must be between 4 and 31");
        }
        logger.info("Using BCrypt encoder with strength {}", strength);
    }

    /**
     * Provides a BCrypt password encoder with the configured strength.
     * Used across the application for secure password hashing.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(bcryptProperties.getStrength());
    }

    /**
     * Exposes the AuthenticationManager bean to be injected where needed.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}