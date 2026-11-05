package com.example.application.auth;

import module java.base;

import com.example.application.platform.AppProperties;

public enum TokenPurpose {
    EMAIL_VERIFICATION, PASSWORD_RESET, REFRESH;

    public Duration ttl(AppProperties.Security security) {
        return switch (this) {
            case EMAIL_VERIFICATION -> security.verificationTtl();
            case PASSWORD_RESET -> security.passwordResetTtl();
            case REFRESH -> security.refreshTokenTtl();
        };
    }
}
