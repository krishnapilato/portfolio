package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

import java.time.Instant;

/**
 * DTO representing the response for user registration.
 * Handles both successful and error scenarios using static factory methods.
 *
 * @param status    Indicates the status of the registration attempt ("success" or "error").
 * @param message   A descriptive message providing context for the response.
 * @param userId    The unique identifier assigned to the newly registered user (only for success responses).
 * @param role      The assigned role of the registered user (if applicable).
 * @param timestamp The exact time when the response was generated.
 */
@Builder
public record RegistrationResponse(
        @NotNull String status,
        @NotNull String message,
        Long userId,
        Role role,
        @NonNull Instant timestamp
) {

    /**
     * Generates a response for a successful user registration.
     *
     * @param userId Unique identifier assigned to the registered user.
     * @param role   The role assigned to the user upon successful registration.
     * @return A {@link RegistrationResponse} object with a success status.
     */
    public static RegistrationResponse success(Long userId, Role role) {
        Instant now = Instant.now();
        return RegistrationResponse.builder()
                .status("success")
                .message("Registration successful.")
                .userId(userId)
                .role(role)
                .timestamp(now)
                .build();
    }

    /**
     * Generates a response for a failed registration attempt.
     *
     * @param message Descriptive message explaining the reason for failure.
     * @return A {@link RegistrationResponse} object with an error status.
     */
    public static RegistrationResponse error(String message) {
        Instant now = Instant.now();
        return RegistrationResponse.builder()
                .status("error")
                .message(message)
                .userId(null)  // No userId for errors
                .role(null)    // No role for errors
                .timestamp(now)
                .build();
    }
}