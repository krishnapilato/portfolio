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
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

/**
 * Controller for authentication-related endpoints.
 * Follows best practices: thin controllers delegating to services,
 * consistent logging, and detailed operation documentation.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user login and registration.")
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final UserService userService;

    @Operation(summary = "User Login", description = "Authenticate a user and generate a JWT token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "403", description = "Account disabled or locked"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginUserRequest request) {
        log.info("Login request for {}", request.email());
        try {
            User user = (User) userService.loadUserByUsername(request.email());
            if (user.isLocked()) {
                log.warn("Login failed: locked account for {}", request.email());
                return forbidden(LoginResponse.error("ACCOUNT_LOCKED", "This account is locked. Contact support."));
            }
            authenticationService.authenticate(request);
            String token = jwtService.generateToken(user);
            long expiresIn = jwtService.extractExpiration(token).toInstant().toEpochMilli();
            log.info("Authentication successful for {}", request.email());
            return ResponseEntity.ok(LoginResponse.success(token, expiresIn, user.getRole()));
        } catch (BadCredentialsException e) {
            log.warn("Invalid credentials for {}", request.email());
            return unauthorized(LoginResponse.error("INVALID_CREDENTIALS", "Invalid email or password."));
        } catch (DisabledException e) {
            log.warn("Disabled account for {}", request.email());
            return forbidden(LoginResponse.error("ACCOUNT_DISABLED", "Your account is disabled."));
        } catch (LockedException e) {
            log.warn("Locked account for {}", request.email());
            return forbidden(LoginResponse.error("ACCOUNT_LOCKED", "This account is locked."));
        } catch (Exception e) {
            log.error("Unexpected error during login for {}", request.email(), e);
            return serverError(LoginResponse.error("SERVER_ERROR", "An unexpected error occurred."));
        }
    }

    @Operation(summary = "User Registration", description = "Register a new user.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Email already in use"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/signup")
    public ResponseEntity<RegistrationResponse> signup(@Valid @RequestBody RegisterUserRequest request) {
        log.info("Registration request for {}", request.email());
        try {
            User user = authenticationService.signup(request);
            log.info("Registration successful for {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(RegistrationResponse.success(user.getId(), Role.USER));
        } catch (DataIntegrityViolationException e) {
            log.warn("Email already taken: {}", request.email());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(RegistrationResponse.error("EMAIL_ALREADY_TAKEN"));
        } catch (RuntimeException e) {
            log.warn("Invalid registration data for {}: {}", request.email(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(RegistrationResponse.error("INVALID_INPUT"));
        } catch (Exception e) {
            log.error("Unexpected error during signup for {}", request.email(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RegistrationResponse.error("INTERNAL_SERVER_ERROR"));
        }
    }

    private ResponseEntity<LoginResponse> unauthorized(LoginResponse body) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    private ResponseEntity<LoginResponse> forbidden(LoginResponse body) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    private ResponseEntity<LoginResponse> serverError(LoginResponse body) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}