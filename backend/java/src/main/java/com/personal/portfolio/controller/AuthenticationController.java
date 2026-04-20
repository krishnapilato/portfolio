package com.personal.portfolio.controller;

import com.personal.portfolio.dto.auth.EmailRequest;
import com.personal.portfolio.dto.auth.MessageResponse;
import com.personal.portfolio.dto.auth.PasswordResetRequest;
import com.personal.portfolio.dto.login.LoginResponse;
import com.personal.portfolio.dto.login.LoginUserRequest;
import com.personal.portfolio.dto.registration.RegisterUserRequest;
import com.personal.portfolio.dto.registration.RegistrationResponse;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.service.AuthenticationService;
import com.personal.portfolio.service.JwtService;
import com.personal.portfolio.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user login and registration.")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticate a user and generate a JWT token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "403", description = "Account disabled or locked")
    })
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginUserRequest request) {
        log.info("Login request received for {}", request.email());

        var user = authenticationService.authenticate(request);
        var token = jwtService.generateToken(user);
        var expiresIn = Duration.between(Instant.now(), jwtService.extractExpiration(token).toInstant()).toSeconds();

        log.info("Authentication successful for {}", request.email());
        return ResponseEntity.ok(new LoginResponse(token, expiresIn, user.getRole(), null));
    }

    @PostMapping("/signup")
    @Operation(summary = "User Registration", description = "Register a new user.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Email already in use")
    })
    public ResponseEntity<RegistrationResponse> signup(@Valid @RequestBody RegisterUserRequest request) {
        log.info("Registration request received for {}", request.email());

        var user = authenticationService.signup(request);
        log.info("Registration successful for {}", user.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RegistrationResponse(user.getId(), Role.USER, null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset", description = "Generates a password reset token if the account exists.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Request accepted")
    })
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody EmailRequest request) {
        passwordResetService.requestPasswordReset(request.email());
        return ResponseEntity.ok(new MessageResponse("If the address exists, a password reset email has been sent.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset a password", description = "Resets a password using a valid password reset token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successful"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired reset token")
    })
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully.", null));
    }
}
