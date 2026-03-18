package com.personal.portfolio;

import com.personal.portfolio.config.admin.AdminConfig;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@EnableScheduling
@ConfigurationPropertiesScan
@SpringBootApplication
public class PortfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }

    @Bean
    @Profile("!prod")
    ApplicationRunner provisionDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder, AdminConfig adminConfig) {
        return args -> {
            if (userRepository.existsByEmail(adminConfig.email())) {
                log.info("Admin [{}] present. Skipping provisioning.", adminConfig.email());
                return;
            }

            var admin = User.builder()
                    .fullName(adminConfig.name())
                    .email(adminConfig.email())
                    .password(passwordEncoder.encode(adminConfig.password()))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .locked(false)
                    .build();

            userRepository.save(admin);
            log.info("Successfully provisioned default active admin: [{}]", adminConfig.email());
        };
    }
}