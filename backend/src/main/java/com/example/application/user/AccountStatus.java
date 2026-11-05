package com.example.application.user;

public enum AccountStatus {
    PENDING, ACTIVE, LOCKED, DISABLED;

    public boolean canTransitionTo(AccountStatus target) {
        return switch (this) {
            case PENDING, LOCKED -> target == ACTIVE || target == DISABLED;
            case ACTIVE -> target == LOCKED || target == DISABLED;
            case DISABLED -> target == ACTIVE;
        };
    }
}
