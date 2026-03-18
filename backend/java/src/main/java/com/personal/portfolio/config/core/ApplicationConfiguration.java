package com.personal.portfolio.config.core;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
public class ApplicationConfiguration {

    @Bean
    public PasswordEncoder passwordEncoder(BcryptProperties bcryptProperties) {
        log.info("Initializing BCrypt encoder with strength: {}", bcryptProperties.strength());
        return new BCryptPasswordEncoder(bcryptProperties.strength());
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}