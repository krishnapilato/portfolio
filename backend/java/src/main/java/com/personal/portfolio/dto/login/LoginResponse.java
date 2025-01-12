package com.personal.portfolio.dto.login;

import com.personal.portfolio.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

import java.time.Instant;

/**
 * DTO for the response of a user login request.
 * Handles both successful and error scenarios using a single constructor.
 *
 * @param status    Indicates the status of the login attempt (e.g., "success" or "error").
 * @param message   A descriptive message for the response.
 * @param token     A JWT token for successful login attempts.
 * @param expiresIn Token expiration time in seconds.
 * @param errorCode An error code for failed login attempts (if applicable).
 * @param role      The role of the authenticated user (if applicable).
 * @param timestamp Timestamp indicating when the response was generated.
 */
@Builder
public record LoginResponse(@NotNull String status, @NotNull String message, String token, long expiresIn,
                            String errorCode, Role role, @NonNull Instant timestamp) {

    /**
     * Factory method for successful login responses.
     *
     * @param token     The JWT token generated after successful authentication.
     * @param expiresIn The duration (in seconds) before the token expires.
     * @param role      The role of the authenticated user.
     * @return A LoginResponse object with success status.
     */
    public static LoginResponse success(String token, long expiresIn, Role role) {
        return LoginResponse.builder().status("success").message("Authentication successful.").token(token).expiresIn(expiresIn).role(role).timestamp(Instant.now()).build();
    }

    /**
     * Factory method for error responses during login.
     *
     * @param errorCode A unique code identifying the error type.
     * @param message   A descriptive error message.
     * @return A LoginResponse object with error status.
     */
    public static LoginResponse error(String errorCode, String message) {
        return LoginResponse.builder().status("error").message(message).errorCode(errorCode).expiresIn(0).role(null).timestamp(Instant.now()).build();
    }
}