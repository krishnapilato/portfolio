package com.personal.portfolio;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.Banner;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

/**
 * Entry point for the Portfolio Application.
 * Initializes the application, sets up caching, and ensures an admin user exists.
 */
@SpringBootApplication
@EnableCaching
public class PortfolioApplication {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioApplication.class);

    @Value("${spring.security.user.name:admin}")
    private String adminUsername;

    @Value("${spring.security.user.password:password}")
    private String adminPassword;

    @Value("${spring.security.user.email:admin.email@gmail.com}")
    private String adminEmail;

    public static void main(String[] args) {
        long start = System.nanoTime();

        SpringApplication app = new SpringApplication(PortfolioApplication.class);
        app.run(args);

        logger.info("Backend is running! Open: http://localhost:8080 (Started in {} ms)", (System.nanoTime() - start) / 1_000_000);
    }

    /**
     * Ensures the default admin user is created in the database if it doesn't already exist.
     *
     * @param userRepository  Repository for user-related operations.
     * @param passwordEncoder Encoder for securing user passwords.
     * @return CommandLineRunner to execute database initialization logic.
     */
    @Bean
    @Profile("!prod")
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (Stream.of(adminUsername, adminPassword, adminEmail).anyMatch(Objects::isNull)) {
                logger.error("Missing admin credentials! Ensure 'adminUsername', 'adminPassword', and 'adminEmail' are properly configured.");
                return;
            }

            CompletableFuture.runAsync(() -> {
                if (!userRepository.existsByEmail(adminEmail)) {
                    createAdminUser(userRepository, passwordEncoder);
                    logger.info("Default admin user created successfully.");
                } else {
                    logger.info("Admin user already exists. Skipping creation.");
                }
            });
        };
    }

    /**
     * Creates the default admin user with predefined credentials.
     *
     * @param userRepository  Repository for user-related operations.
     * @param passwordEncoder Encoder for securing user passwords.
     */
    private void createAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        User adminUser = new User();
        adminUser.setFullName(adminUsername);
        adminUser.setEmail(adminEmail);
        adminUser.setPassword(passwordEncoder.encode(adminPassword));
        adminUser.setRole(Role.ADMIN);
        adminUser.setCreatedAt(Date.from(Instant.now()));
        adminUser.setUpdatedAt(Date.from(Instant.now()));
        adminUser.setLastLogin(Instant.now());

        userRepository.save(adminUser);
    }
}