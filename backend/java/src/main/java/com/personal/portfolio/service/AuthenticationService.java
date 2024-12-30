package com.personal.portfolio.service;

import java.time.Instant;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service for handling user authentication and registration.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

	private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

	// Constants for logging and exception messages
	private static final String USER_EMAIL_EXISTS = "User with email %s already exists";
	private static final String USER_REGISTRATION_SUCCESS = "User registration successful for ID: %d";
	private static final String AUTHENTICATION_FAILED = "Authentication failed for email: %s";
	private static final String USER_NOT_FOUND = "User not found with email: %s";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;

	/**
	 * Registers a new user.
	 *
	 * @param input The registration request containing user details.
	 * @return The saved user entity.
	 * @throws DuplicateKeyException if a user with the given email already exists.
	 */
	public User signup(RegisterUserRequest input) {
		logger.info("Starting user registration for email: {}", input.email());

		// Check if the user email already exists
		if (userRepository.existsByEmail(input.email())) {
			logger.warn(USER_EMAIL_EXISTS, input.email());
			throw new DuplicateKeyException(String.format(USER_EMAIL_EXISTS, input.email()));
		}

		// Create and save the new user
		User user = new User();
		user.setFullName(input.fullName());
		user.setEmail(input.email());
		user.setPassword(passwordEncoder.encode(input.password()));
		user.setRole(Role.USER);
		user.setCreatedAt(Date.from(Instant.now()));
		user.setUpdatedAt(Date.from(Instant.now()));

		User savedUser = userRepository.save(user);
		logger.info(USER_REGISTRATION_SUCCESS, savedUser.getId());

		return savedUser;
	}

	/**
	 * Authenticates a user.
	 *
	 * @param input The login request containing email and password.
	 * @return The authenticated user entity.
	 * @throws BadCredentialsException if authentication fails.
	 * @throws UsernameNotFoundException if the user is not found.
	 */
	public User authenticate(LoginUserRequest input) {
		logger.info("Attempting authentication for email: {}", input.email());

		try {
			// Perform authentication
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(input.email(), input.password())
			);
		} catch (AuthenticationException e) {
			logger.error(AUTHENTICATION_FAILED, input.email(), e);
			throw new BadCredentialsException("Invalid credentials provided");
		}

		// Retrieve and return the authenticated user
		return userRepository.findByEmail(input.email())
				.orElseThrow(() -> new UsernameNotFoundException(String.format(USER_NOT_FOUND, input.email())));
	}
}