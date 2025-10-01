package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.Instant;

/**
 * DTO representing the response for user registration.
 * Handles both successful and error scenarios using static factory methods.
 */
@Builder(toBuilder = true)
public record RegistrationResponse(

        @NotNull String status,
        @NotNull String message,
        Long userId,
        Role role,
        @NotNull Instant timestamp

) {

    /**
     * Factory method for successful registration response.
     *
     * @param userId Unique ID of the registered user.
     * @param role   Assigned user role.
     * @return success RegistrationResponse.
     */
    public static RegistrationResponse success(Long userId, Role role) {
        return RegistrationResponse.builder()
                .status("success")
                .message("Registration successful.")
                .userId(userId)
                .role(role)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Factory method for failed registration response.
     *
     * @param message Description of the failure reason.
     * @return error RegistrationResponse.
     */
    public static RegistrationResponse error(String message) {
        return RegistrationResponse.builder()
                .status("error")
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Checks if the response represents success.
     *
     * @return true if success, false if error.
     */
    public boolean isSuccess() {
        return "success".equalsIgnoreCase(status);
    }

    /**
     * Checks if the response represents an error.
     *
     * @return true if error, false if success.
     */
    public boolean isError() {
        return "error".equalsIgnoreCase(status);
    }
}