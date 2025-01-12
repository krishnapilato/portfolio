package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

import java.time.Instant;

/**
 * DTO for the response of a user registration request.
 * Handles both successful and error scenarios using a single constructor.
 *
 * @param status    Indicates the status of the registration attempt (e.g., "success" or "error").
 * @param message   A descriptive message for the response.
 * @param userId    Unique identifier of the registered user (populated in case of success).
 * @param role      The role assigned to the user (if applicable).
 * @param timestamp Timestamp indicating when the response was generated.
 */
@Builder
public record RegistrationResponse(@NotNull String status, @NotNull String message, Long userId, Role role,
                                   @NonNull Instant timestamp) {

    /**
     * Factory method for successful registration responses.
     *
     * @param userId Unique identifier for the registered user.
     * @param role   The role assigned to the user upon successful registration.
     * @return A RegistrationResponse object with success status.
     */
    public static RegistrationResponse success(Long userId, Role role) {
        return RegistrationResponse.builder().status("success").message("Registration successful.").userId(userId).role(role).timestamp(Instant.now()).build();
    }

    /**
     * Factory method for error registration responses.
     *
     * @param message Describes the reason for the error or failure.
     * @return A RegistrationResponse object with error status.
     */
    public static RegistrationResponse error(String message) {
        return RegistrationResponse.builder().status("error").message(message).userId(null).role(null).timestamp(Instant.now()).build();
    }
}