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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
     * Registers a new user.
     *
     * @param input The registration request containing user details.
     * @return The saved user entity.
     * @throws DuplicateKeyException if a user with the given email already exists.
     */
    public User signup(RegisterUserRequest input) {
        if (userRepository.existsByEmail(input.email())) {
            throw new DuplicateKeyException(String.format("User with email %s already exists", input.email()));
        }

        User user = new User();
        user.setFullName(input.fullName());
        user.setEmail(input.email());
        user.setPassword(passwordEncoder.encode(input.password()));
        user.setRole(Role.USER);
        user.setCreatedAt(Date.from(Instant.now()));
        user.setUpdatedAt(Date.from(Instant.now()));
        user.setLastLogin(Instant.now());

        return userRepository.save(user);
    }

    /**
     * Authenticates a user.
     *
     * @param input The login request containing email and password.
     * @throws BadCredentialsException   if authentication fails.
     * @throws UsernameNotFoundException if the user is not found.
     */
    public void authenticate(LoginUserRequest input) {
        logger.info("Attempting authentication for email: {}", input.email());

        try {
            // Attempt authentication
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.email(), input.password()));
        } catch (BadCredentialsException e) {
            logger.error("Invalid credentials provided for email: {}", input.email(), e);
            throw e; // Rethrow the exception to keep the original stack trace intact
        } catch (UsernameNotFoundException e) {
            logger.error("User not found for email: {}", input.email(), e);
            throw e; // Rethrow the exception to keep the original stack trace intact
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for email: {}", input.email(), e);
            throw new BadCredentialsException("Invalid credentials provided");
        }
    }
}