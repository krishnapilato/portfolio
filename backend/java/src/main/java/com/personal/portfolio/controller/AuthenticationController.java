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
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
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
            final User user = (User) userService.loadUserByUsername(loginUserDto.email());
            if (user.isLocked()) {
                logger.warn("Authentication failed: Locked account for {}", loginUserDto.email());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(LoginResponse.error("ACCOUNT_LOCKED", "This account is locked. Please contact support."));
            }

            authenticationService.authenticate(loginUserDto);
            final String jwtToken = jwtService.generateToken(user);
            final long expirationMillis = jwtService.extractExpiration(jwtToken)
                    .toInstant()
                    .toEpochMilli();

            return ResponseEntity.ok(LoginResponse.success(jwtToken, expirationMillis, user.getRole()));

        } catch (BadCredentialsException e) {
            logger.warn("Login attempt failed for {} due to invalid credentials.", loginUserDto.email());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.error("INVALID_CREDENTIALS", "Invalid email or password."));
        } catch (DisabledException e) {
            logger.warn("Login attempt failed for {} due to disabled account.", loginUserDto.email());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(LoginResponse.error("ACCOUNT_DISABLED", "Your account is disabled. Contact support."));
        } catch (LockedException e) {
            logger.warn("Login attempt failed for {} due to locked account.", loginUserDto.email());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(LoginResponse.error("ACCOUNT_LOCKED", "This account is locked. Please contact support."));
        } catch (Exception e) {
            logger.error("Unexpected error during authentication for {}", loginUserDto.email(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LoginResponse.error("SERVER_ERROR", "An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/signup")
    @Operation(summary = "User Registration", description = "Register a new user.")
    public ResponseEntity<RegistrationResponse> signup(@Valid @RequestBody RegisterUserRequest registerUserDto) {
        try {
            final User registeredUser = authenticationService.signup(registerUserDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(RegistrationResponse.success(registeredUser.getId(), Role.USER));
        } catch (DataIntegrityViolationException ex) {
            logger.warn("Registration failed: Email already in use - {}", registerUserDto.email());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(RegistrationResponse.error("EMAIL_ALREADY_TAKEN"));
        } catch (ConstraintViolationException ex) {
            logger.warn("Invalid user registration data: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(RegistrationResponse.error("INVALID_INPUT"));
        } catch (IllegalArgumentException ex) {
            logger.warn("Invalid registration attempt: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(RegistrationResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Unexpected error during user registration", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RegistrationResponse.error("INTERNAL_SERVER_ERROR"));
        }
    }
}