package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;

import java.time.Instant;

public record RegistrationResponse(
        Long userId,
        Role role,
        Instant timestamp
) {
    public RegistrationResponse {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}