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

/**
 * Entry point for the Portfolio Application.
 * Initializes the application, sets up caching, and ensures an admin user exists.
 */
@SpringBootApplication
@EnableCaching
public class PortfolioApplication {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioApplication.class);

    @Value("${spring.security.user.name:admin}")
    private String adminUsername; // Admin username from application properties

    @Value("${spring.security.user.password:password}")
    private String adminPassword; // Admin password from application properties

    @Value("${spring.security.user.email:admin.email@gmail.com}")
    private String adminEmail; // Admin email from application properties

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(PortfolioApplication.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }

    /**
     * Ensures the default admin user is created in the database if it doesn't already exist.
     * This bean runs only in non-production profiles to avoid unnecessary checks in production.
     *
     * @param userRepository  Repository for user-related operations.
     * @param passwordEncoder Encoder for securing user passwords.
     * @return CommandLineRunner to execute database initialization logic.
     */
    @Bean
    @Profile("!prod")  // Avoid running in production environments
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminUsername == null || adminPassword == null || adminEmail == null) {
                logger.error("Admin credentials are not properly configured. Ensure properties are set.");
                return;
            }

            userRepository.findByEmail(adminEmail).ifPresentOrElse(user -> logger.info("Admin user already exists. Skipping creation."), () -> createAdminUser(userRepository, passwordEncoder));
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
        logger.info("Created default admin user with email: {}", adminEmail);
    }
}