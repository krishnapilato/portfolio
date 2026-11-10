package com.example.seed.plan;

import module java.base;

final class PlanException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    PlanException(String message) {
        super(message, null, false, false);
    }
}
