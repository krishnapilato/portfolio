package com.personal.portfolio.dto.login;

import com.personal.portfolio.model.Role;
import java.time.Instant;

public record LoginResponse(
        String token,
        long expiresIn,
        Role role,
        Instant timestamp
) {
    public LoginResponse {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}