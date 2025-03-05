package com.personal.portfolio.dto.login;

import com.personal.portfolio.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

import java.time.Instant;

/**
 * DTO for handling user login responses.
 * Supports both successful and error responses using static factory methods.
 *
 * @param status    Status of the login attempt ("success" or "error").
 * @param message   Descriptive message regarding the login result.
 * @param token     JWT token (present only in successful login responses).
 * @param expiresIn Expiration duration of the JWT token in seconds.
 * @param errorCode Unique error code for failed login attempts.
 * @param role      Assigned role of the authenticated user (if applicable).
 * @param timestamp Timestamp of when the response was generated.
 */
@Builder
public record LoginResponse(
        @NotNull String status,
        @NotNull String message,
        String token,
        long expiresIn, // Defaults to 0 for error responses
        String errorCode,
        Role role,
        @NonNull Instant timestamp
) {

    /**
     * Generates a response for a successful login attempt.
     *
     * @param token     The JWT token issued after authentication.
     * @param expiresIn The expiration time (in seconds) of the token.
     * @param role      The assigned role of the authenticated user.
     * @return A successful {@link LoginResponse} object.
     */
    public static LoginResponse success(String token, long expiresIn, Role role) {
        Instant now = Instant.now();
        return LoginResponse.builder()
                .status("success")
                .message("Authentication successful.")
                .token(token)
                .expiresIn(expiresIn)
                .role(role)
                .timestamp(now)
                .build();
    }

    /**
     * Generates a response for a failed login attempt.
     *
     * @param errorCode A predefined error code representing the failure reason.
     * @param message   A human-readable description of the error.
     * @return An error {@link LoginResponse} object.
     */
    public static LoginResponse error(String errorCode, String message) {
        Instant now = Instant.now();
        return LoginResponse.builder()
                .status("error")
                .message(message)
                .errorCode(errorCode)
                .expiresIn(0) // Default to 0 for error responses
                .role(null)
                .timestamp(now)
                .build();
    }
}