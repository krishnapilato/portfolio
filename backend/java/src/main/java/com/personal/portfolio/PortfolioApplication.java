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
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Entry point for the Portfolio Application.
 * Initializes the application, sets up caching, and ensures an admin user exists.
 *
 * @author Khova Krishna
 * @version 0.1.0
 */
@SpringBootApplication
public class PortfolioApplication {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioApplication.class);

    static void main(String[] args) {
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
     * @param adminConfig Configuration with admin credentials.
     * @param passwordEncoder Password encoder for secure storage.
     * @param env Spring environment for logging.
     * @return CommandLineRunner to execute database initialization logic.
     */
    @Bean
    @Profile("!prod")
    public CommandLineRunner initDatabase(UserService userService,
                                          AdminConfig adminConfig,
                                          PasswordEncoder passwordEncoder,
                                          Environment env) {
        return _ -> {
            // Validate required config
            if (Stream.of(adminConfig.getName(), adminConfig.getPassword(), adminConfig.getEmail())
                    .anyMatch(Objects::isNull)) {
                throw new IllegalStateException("Startup error: Missing admin credentials! Check application.yml.");
            }

            // Create admin if not present
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
                logger.info("ℹAdmin user '{}' already exists. Skipping creation.", adminConfig.getEmail());
            }

            // Dynamic startup log
            String port = env.getProperty("server.port", "8080");
            String[] profiles = env.getActiveProfiles();
            logger.info("Application started on http://localhost:{} with profiles: {}", port, Arrays.toString(profiles));
        };
    }
}