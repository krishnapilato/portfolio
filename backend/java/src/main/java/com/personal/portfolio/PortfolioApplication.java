package com.personal.portfolio;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional; // Import for @Transactional

import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

/**
 * Entry point for the Portfolio Application.
 * Initializes the application, sets up caching, and ensures an admin user exists.
 *
 * @author Krishna
 * @version 0.8.5
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
        SpringApplication app = new SpringApplication(PortfolioApplication.class);
        app.run(args);
    }

    /**
     * Ensures the default admin user is created in the database if it doesn't already exist.
     * This bean is active only in non-production environments (`!prod` profile) to prevent
     * automatic admin creation in production.
     *
     * @param userRepository  Repository for user-related operations.
     * @param passwordEncoder Encoder for securing user passwords.
     * @return CommandLineRunner to execute database initialization logic.
     */
    @Bean
    @Profile("!prod")
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Validate essential admin credentials before proceeding.
            if (Stream.of(adminUsername, adminPassword, adminEmail).anyMatch(Objects::isNull)) {
                logger.error("Application startup error: Missing admin credentials! " +
                        "Ensure 'spring.security.user.name', 'spring.security.user.password', " +
                        "and 'spring.security.user.email' are properly configured in application.properties/yml.");
                return; // Prevent further execution if credentials are not set.
            }

            // Perform the admin user check and creation asynchronously.
            CompletableFuture.runAsync(() -> {
                try {
                    // Check if the admin user already exists by email.
                    if (!userRepository.existsByEmail(adminEmail)) {
                        createAdminUser(userRepository, passwordEncoder);
                        logger.info("Default admin user '{}' created successfully.", adminEmail);
                    } else {
                        logger.info("Admin user '{}' already exists. Skipping creation.", adminEmail);
                    }
                } catch (Exception e) {
                    // Log any exceptions that occur during the async operation.
                    logger.error("Error during admin user initialization: {}", e.getMessage(), e);
                } finally {
                    // This message indicates the backend is ready, regardless of admin user creation status.
                    logger.info("Backend is running! Access it at: http://localhost:8080");
                }
            });
        };
    }

    /**
     * Creates the default admin user with predefined credentials.
     * This method is marked as @Transactional to ensure atomicity of the database operation.
     *
     * @param userRepository  Repository for user-related operations.
     * @param passwordEncoder Encoder for securing user passwords.
     */
    @Transactional // Ensures this method runs within a transaction.
    private void createAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        User adminUser = new User();
        adminUser.setFullName(adminUsername);
        adminUser.setEmail(adminEmail);
        adminUser.setPassword(passwordEncoder.encode(adminPassword));
        adminUser.setRole(Role.ADMIN);
        adminUser.setCreatedAt(new Date());
        adminUser.setUpdatedAt(new Date());
        adminUser.setLastLogin(Instant.now());

        userRepository.save(adminUser);
        logger.debug("Admin user object saved to database: {}", adminUser.getEmail());
    }
}