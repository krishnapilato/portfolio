package com.personal.portfolio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

@SpringBootApplication
public class PortfolioApplication {

	private static final Logger logger = LoggerFactory.getLogger(PortfolioApplication.class);

	@Value("${spring.security.user.password}")
	private String adminPassword;

	public static void main(String[] args) {
		SpringApplication.run(PortfolioApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Check if the admin user already exists
			if (!userRepository.existsByEmail("krishnak.pilato@gmail.com")) {
				createAdminUser(userRepository, passwordEncoder);
			} else {
				logger.info("Admin user already exists. Skipping creation.");
			}
		};
	}

	private void createAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		// Create and save the default admin user
		User adminUser = new User();
		adminUser.setFullName("Khova Krishna Pilato");
		adminUser.setEmail("krishnak.pilato@gmail.com");
		adminUser.setPassword(passwordEncoder.encode(adminPassword));
		adminUser.setRole(Role.ADMIN);
		adminUser.setEnabled(true);

		userRepository.save(adminUser);
		logger.info("Created default admin user with email: krishnak.pilato@gmail.com");
	}
}