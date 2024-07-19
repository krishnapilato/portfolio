package com.personal.portfolio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.personal.portfolio.dto.login.LoginUserDto;
import com.personal.portfolio.dto.registration.RegisterUserDto;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

@Service
public class AuthenticationService {

	private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;

	public AuthenticationService(UserRepository userRepository, AuthenticationManager authenticationManager,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.authenticationManager = authenticationManager;
		this.passwordEncoder = passwordEncoder;
	}

	public User signup(RegisterUserDto input) {
		logger.info("Starting user registration for email: {}", input.getEmail());

		if (userRepository.findByEmail(input.getEmail()).isPresent()) {
			logger.warn("User registration attempt failed: User with email {} already exists", input.getEmail());
			throw new IllegalArgumentException("User with email already exists");
		}

		User user = new User();
		user.setFullName(input.getFullName());
		user.setEmail(input.getEmail());
		user.setPassword(passwordEncoder.encode(input.getPassword()));
		user.setRole(Role.USER);

		User savedUser = userRepository.save(user);
		logger.info("User registration successful for ID: {}", savedUser.getId());

		return savedUser;
	}

	public User authenticate(LoginUserDto input) {
		logger.info("Attempting authentication for email: {}", input.getEmail());
		try {
			authenticationManager
					.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));
		} catch (Exception e) {
			logger.error("Authentication failed for email: {}", input.getEmail());
			throw new RuntimeException("Authentication failed");
		}

		User user = userRepository.findByEmail(input.getEmail())
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + input.getEmail()));

		logger.info("Authentication successful for user: {}", user.getEmail());
		return user;
	}
}