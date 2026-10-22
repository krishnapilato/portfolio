package com.personal.portfolio.auth;

import module java.base;

import com.personal.portfolio.platform.AppProperties;

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
