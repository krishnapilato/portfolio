package com.personal.portfolio.service;

import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service responsible for handling user authentication and registration.
 * Provides transactional operations and logs security-critical events.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Authenticates a user based on their login credentials.
     *
     * @param input The login request containing email and password.
     * @throws BadCredentialsException if authentication fails due to invalid credentials.
     */
    public void authenticate(LoginUserRequest input) {
        logger.info("Attempting authentication for email: {}", input.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(input.email(), input.password())
            );
            logger.info("Authentication successful for email: {}", input.email());
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for email: {}", input.email());
            throw new BadCredentialsException("Invalid credentials provided", e);
        }
    }

    /**
     * Registers a new user in the system.
     *
     * @param input The registration request with user details.
     * @return The saved User entity, including its generated ID.
     * @throws DuplicateKeyException if a user with the given email already exists.
     */
    @Transactional
    public User signup(RegisterUserRequest input) {
        if (userRepository.existsByEmail(input.email())) {
            logger.warn("Signup attempt failed: email {} already exists.", input.email());
            throw new DuplicateKeyException("User with email " + input.email() + " already exists.");
        }

        User user = User.builder()
                .fullName(input.fullName())
                .email(input.email())
                .password(passwordEncoder.encode(input.password()))
                .role(Role.USER)
                .lastLogin(Instant.now())
                .build();

        User savedUser = userRepository.save(user);
        logger.info("New user registered with email: {}", savedUser.getEmail());
        return savedUser;
    }
}