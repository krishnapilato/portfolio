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
        }).orElseThrow(() -> new UsernameNotFoundException("User with email " + username + " not found"));
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder(@Value("${bcrypt.strength:15}") int strength) {
        return new BCryptPasswordEncoder(strength);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder(15));
        return authProvider;
    }
}