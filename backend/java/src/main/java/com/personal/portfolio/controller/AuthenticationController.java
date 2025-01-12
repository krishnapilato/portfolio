package com.personal.portfolio.controller;

import com.personal.portfolio.dto.login.LoginResponse;
import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.dto.registration.RegistrationResponse;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.service.AuthenticationService;
import com.personal.portfolio.service.JwtService;
import com.personal.portfolio.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration.")
public class AuthenticationController {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticate a user and generate a JWT token.")
    public ResponseEntity<LoginResponse> authenticate(@Valid @RequestBody LoginUserRequest loginUserDto) {
        try {
            // Attempt to load the user once
            User user = (User) userService.loadUserByUsername(loginUserDto.email());

            // Check if the user is locked immediately
            if (user.isLocked()) {
                logger.warn("Authentication failed: user {} is locked.", loginUserDto.email());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(LoginResponse.error("ACCOUNT_LOCKED", "This account is locked. Please contact support."));
            }

            // Authenticate the user
            authenticationService.authenticate(loginUserDto);

            // Generate JWT token and calculate expiration
            String jwtToken = jwtService.generateToken(user);
            long expirationMillis = jwtService.extractExpiration(jwtToken).toInstant().toEpochMilli();

            // Return success response
            return ResponseEntity.ok(LoginResponse.success(jwtToken, expirationMillis, user.getRole()));

        } catch (BadCredentialsException e) {
            // Handle invalid credentials quickly without unnecessary logging in the catch block
            logger.warn("Authentication failed for email: {}. Invalid credentials.", loginUserDto.email());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(LoginResponse.error("INVALID_CREDENTIALS", "Invalid credentials provided."));
        } catch (Exception e) {
            // Catch unexpected errors more efficiently
            logger.error("Unexpected error during authentication", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(LoginResponse.error("SERVER_ERROR", "An unexpected error occurred."));
        }
    }

    @PostMapping("/signup")
    @Operation(summary = "User Registration", description = "Register a new user.")
    public ResponseEntity<RegistrationResponse> signup(@Valid @RequestBody RegisterUserRequest registerUserDto) {
        try {
            // Attempt to register the user
            User registeredUser = authenticationService.signup(registerUserDto);

            // Return a success response
            return ResponseEntity.status(HttpStatus.CREATED).body(RegistrationResponse.success(registeredUser.getId(), Role.USER));
        } catch (DataIntegrityViolationException ex) {
            // Handle duplicate email quickly without unnecessary logging
            logger.warn("Registration failed due to duplicate email: {}", registerUserDto.email());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(RegistrationResponse.error("DUPLICATE_EMAIL"));
        } catch (Exception ex) {
            // Log unexpected errors more efficiently
            logger.error("An error occurred during user registration", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(RegistrationResponse.error("SERVER_ERROR"));
        }
    }
}