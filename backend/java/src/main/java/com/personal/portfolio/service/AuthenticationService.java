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

	public User signup(RegisterUserRequest input) {
		logger.info("Starting user registration for email: {}", input.getEmail());

		if (userRepository.existsByEmail(input.getEmail())) {
			logger.warn("User registration attempt failed: " + USER_EMAIL_EXISTS, input.getEmail());
			throw new DuplicateKeyException(String.format(USER_EMAIL_EXISTS, input.getEmail()));
		}

		User user = new User();
		user.setFullName(input.getFullName());
		user.setEmail(input.getEmail());
		user.setPassword(passwordEncoder.encode(input.getPassword()));
		user.setRole(Role.USER);
		user.setCreatedAt(Date.from(Instant.now()));
		user.setUpdatedAt(Date.from(Instant.now()));

		User savedUser = userRepository.save(user);
		logger.info(String.format(USER_REGISTRATION_SUCCESS, savedUser.getId()));

		return savedUser;
	}

	public User authenticate(LoginUserRequest input) {
		logger.info("Attempting authentication for email: {}", input.getEmail());

		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));
		} catch (AuthenticationException e) {
			logger.error(String.format(AUTHENTICATION_FAILED, input.getEmail()), e);
			throw new BadCredentialsException("Invalid credentials provided");
		}

		return userRepository.findByEmail(input.getEmail())
				.orElseThrow(() -> new UsernameNotFoundException(String.format(USER_NOT_FOUND, input.getEmail())));
	}
}