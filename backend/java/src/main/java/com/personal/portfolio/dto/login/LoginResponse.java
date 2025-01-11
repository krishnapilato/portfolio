package com.personal.portfolio.dto.login;

import com.personal.portfolio.model.Role;
import lombok.Getter;

import java.time.Instant;

/**
 * DTO for the response of a user login request.
 * Handles both successful and error scenarios.
 */
@Getter
public class LoginResponse {

    // Indicates the status of the login attempt (e.g., "success" or "error").
    private final String status;

    // A descriptive message for the response.
    private final String message;

    // A JWT token for successful login attempts.
    private final String token;

    // Token expiration time in seconds.
    private final long expiresIn;

    // An error code for failed login attempts (if applicable).
    private final String errorCode;

    // The role of the authenticated user (if applicable).
    private final Role role;

    // Timestamp indicating when the response was generated.
    private final Instant timestamp;

    /**
     * Constructor for successful login responses.
     *
     * @param token     The JWT token generated after successful authentication.
     * @param expiresIn The duration (in seconds) before the token expires.
     * @param role      The role of the authenticated user.
     */
    public LoginResponse(String token, long expiresIn, Role role) {
        this.status = "success";
        this.message = "Authentication successful.";
        this.token = token;
        this.expiresIn = expiresIn;
        this.role = role;
        this.errorCode = null;
        this.timestamp = Instant.now();
    }

    /**
     * Constructor for error responses during login.
     *
     * @param errorCode A unique code identifying the error type.
     * @param message   A descriptive error message.
     */
    public LoginResponse(String errorCode, String message) {
        this.status = "error";
        this.message = message;
        this.token = null;
        this.expiresIn = 0;
        this.role = null;
        this.errorCode = errorCode;
        this.timestamp = Instant.now();
    }
}