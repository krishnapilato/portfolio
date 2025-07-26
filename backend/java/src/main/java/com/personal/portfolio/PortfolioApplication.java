package com.personal.portfolio;

import com.personal.portfolio.config.admin.AdminConfig;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.Banner;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import java.util.Objects;
import java.util.stream.Stream;

/**
 * Entry point for the Portfolio Application.
 * Initializes the application, sets up caching, and ensures an admin user exists.
 *
 * @author Khova Krishna
 * @version 0.0.5
 */
@SpringBootApplication
public class PortfolioApplication {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioApplication.class);

    public static void main(String[] args) {
        new SpringApplicationBuilder(PortfolioApplication.class)
                .bannerMode(Banner.Mode.CONSOLE)
                .logStartupInfo(true)
                .run(args);
    }

    /**
     * Ensures the default admin user is created in the database if it doesn't already exist.
     * This bean is active only in non-production environments (`!prod` profile) to prevent
     * automatic admin creation in production.
     *
     * @param userService Service for user-related operations.
     * @return CommandLineRunner to execute database initialization logic.
     */
    @Bean
    @Profile("!prod")
    public CommandLineRunner initDatabase(UserService userService, AdminConfig adminConfig) {
        return args -> {
            if (Stream.of(adminConfig.getName(), adminConfig.getPassword(), adminConfig.getEmail())
                    .anyMatch(Objects::isNull)) {
                logger.error("Startup error: Missing admin credentials! Check application.yml.");
                return;
            }

            if (!userService.existsByEmail(adminConfig.getEmail())) {
                User adminUser = new User();
                adminUser.setFullName(adminConfig.getName());
                adminUser.setEmail(adminConfig.getEmail());
                adminUser.setPassword(adminConfig.getPassword());
                adminUser.setRole(Role.ADMIN);
                adminUser.setEnabled(true);

                userService.createUser(adminUser);
                logger.info("Default admin user '{}' created successfully.", adminConfig.getEmail());
            } else {
                logger.info("Admin user '{}' already exists. Skipping creation.", adminConfig.getEmail());
            }

            logger.info("Application started! Access at: http://localhost:8080");
        };
    }
}