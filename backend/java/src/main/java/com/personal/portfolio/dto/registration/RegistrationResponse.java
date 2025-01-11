package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.Optional;

/**
 * Represents the response for user registration.
 * Handles both success and error cases.
 */
@Getter
@Setter
@ToString
public class RegistrationResponse {

    // Status of the registration process, e.g., "success" or "error".
    private String status;

    // Message providing additional details about the registration outcome.
    private String message;

    // Unique identifier of the registered user (populated in case of success).
    private Long userId;

    // The role assigned to the user (if applicable).
    private Optional<Role> role;

    // Timestamp of the response, indicating when it was created.
    private Instant timestamp;

    /**
     * Default constructor for creating an empty registration response.
     * Typically used for initializing the response without pre-set values.
     */
    public RegistrationResponse() {
        this.timestamp = Instant.now();
        this.role = Optional.empty();
    }

    /**
     * Constructor for successful registration responses.
     *
     * @param userId Unique identifier for the registered user.
     * @param role   The role assigned to the user upon successful registration.
     */
    public RegistrationResponse(Long userId, Role role) {
        this.status = "success";
        this.message = "Registration successful.";
        this.userId = userId;
        this.role = Optional.ofNullable(role);
        this.timestamp = Instant.now();
    }

    /**
     * Constructor for error registration responses.
     *
     * @param status  Indicates the registration status, typically "error".
     * @param message Describes the reason for the error or failure.
     */
    public RegistrationResponse(String status, String message) {
        this.status = status;
        this.message = message;
        this.userId = null;
        this.role = Optional.empty();
        this.timestamp = Instant.now();
    }
}