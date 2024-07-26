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

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;

	public User signup(RegisterUserRequest input) {
		logger.info("Starting user registration for email: {}", input.getEmail());

		if (userRepository.existsByEmail(input.getEmail())) {
			logger.warn("User registration attempt failed: User with email {} already exists", input.getEmail());
			throw new DuplicateKeyException("User with email " + input.getEmail() + " already exists");
		}

		User user = new User();
		user.setFullName(input.getFullName());
		user.setEmail(input.getEmail());
		user.setPassword(passwordEncoder.encode(input.getPassword()));
		user.setRole(Role.USER);
		user.setCreatedAt(Date.from(Instant.now()));
		user.setUpdatedAt(Date.from(Instant.now()));

		User savedUser = userRepository.save(user);
		logger.info("User registration successful for ID: {}", savedUser.getId());

		return savedUser;
	}

	public User authenticate(LoginUserRequest input) {
		logger.info("Attempting authentication for email: {}", input.getEmail());

		try {
			authenticationManager
					.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));
		} catch (AuthenticationException e) {
			logger.error("Authentication failed for email: {}", input.getEmail(), e);
			throw new BadCredentialsException("Invalid credentials provided");
		}

		return userRepository.findByEmail(input.getEmail())
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + input.getEmail()));
	}
}