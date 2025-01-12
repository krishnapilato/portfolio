package com.personal.portfolio.config;

import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for application-wide authentication and security settings.
 * Defines beans for user details, password encoding, and authentication mechanisms.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfiguration.class);
    private final UserRepository userRepository;

    /**
     * Configures the {@link UserDetailsService} to fetch user details from the database
     * based on the provided username (email).
     *
     * @return a custom {@link UserDetailsService} implementation.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username).map(user -> {
            logger.info("User found: {}", username);
            return user;
        }).orElseThrow(() -> {
            logger.error("User with email {} not found", username);  // Better traceability
            return new UsernameNotFoundException("User with email " + username + " not found");
        });
    }

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

    /**
     * Defines the {@link AuthenticationProvider} for authenticating users.
     * Uses the custom UserDetailsService and PasswordEncoder.
     *
     * @return the configured AuthenticationProvider.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder(15)); // Setting the password encoder
        return authProvider;
    }
}