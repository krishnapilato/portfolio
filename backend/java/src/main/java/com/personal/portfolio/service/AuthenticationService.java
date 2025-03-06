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
import java.util.Date;

/**
 * Service for handling user authentication and registration.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Authenticates a user.
     *
     * @param input The login request containing email and password.
     * @throws BadCredentialsException if authentication fails.
     */
    public void authenticate(LoginUserRequest input) {
        logger.info("Attempting authentication for email: {}", input.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(input.email(), input.password())
            );
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for email: {}", input.email());
            if (e instanceof BadCredentialsException) {
                throw e;
            }
            throw new BadCredentialsException("Invalid credentials provided", e);
        }
    }

    /**
     * Registers a new user.
     *
     * @param input The registration request containing user details.
     * @return The saved user entity.
     * @throws DuplicateKeyException if a user with the given email already exists.
     */
    @Transactional
    public User signup(RegisterUserRequest input) {
        if (userRepository.existsByEmail(input.email())) {
            throw new DuplicateKeyException("User with email " + input.email() + " already exists.");
        }

        Instant now = Instant.now();
        Date nowDate = Date.from(now);

        User user = new User();
        user.setFullName(input.fullName());
        user.setEmail(input.email());
        user.setPassword(passwordEncoder.encode(input.password()));
        user.setRole(Role.USER);
        user.setCreatedAt(nowDate);
        user.setUpdatedAt(nowDate);
        user.setLastLogin(now);

        User savedUser = userRepository.save(user);
        logger.info("User registered with email: {}", input.email());
        return savedUser;
    }
}