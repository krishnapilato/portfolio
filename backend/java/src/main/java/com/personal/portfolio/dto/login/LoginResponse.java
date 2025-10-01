package com.personal.portfolio.dto.login;

import java.time.Instant;

import com.personal.portfolio.model.Role;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * DTO for handling user login responses.
 * Supports both successful and error responses using static factory methods.
 */
@Builder(toBuilder = true)
public record LoginResponse(

        @NotNull String status,
        @NotNull String message,
        String token,
        long expiresIn,
        String errorCode,
        Role role,
        @NotNull Instant timestamp

) {

    /**
     * Factory method for successful login responses.
     *
     * @param token     The JWT token issued after authentication.
     * @param expiresIn Token expiration time in seconds.
     * @param role      Assigned user role.
     * @return a successful LoginResponse.
     */
    public static LoginResponse success(String token, long expiresIn, Role role) {
        return LoginResponse.builder()
                .status("success")
                .message("Authentication successful.")
                .token(token)
                .expiresIn(expiresIn)
                .role(role)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Factory method for failed login responses.
     *
     * @param errorCode Error code representing the failure reason.
     * @param message   Human-readable error message.
     * @return an error LoginResponse.
     */
    public static LoginResponse error(String errorCode, String message) {
        return LoginResponse.builder()
                .status("error")
                .message(message)
                .errorCode(errorCode)
                .expiresIn(0)
                .role(null)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Checks if the response represents success.
     *
     * @return true if success, false otherwise.
     */
    public boolean isSuccess() {
        return "success".equalsIgnoreCase(status);
    }

    /**
     * Checks if the response represents an error.
     *
     * @return true if error, false otherwise.
     */
    public boolean isError() {
        return "error".equalsIgnoreCase(status);
    }
}