package com.personal.portfolio.dto.auth;

import java.time.Instant;

public record MessageResponse(
        String message,
        Instant timestamp
) {
    public MessageResponse {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
