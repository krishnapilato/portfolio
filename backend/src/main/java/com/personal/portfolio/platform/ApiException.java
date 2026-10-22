package com.personal.portfolio.platform;

import module java.base;

public final class ApiException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    private final transient Problem problem;

    public ApiException(Problem problem) {
        super(problem.toString(), null, false, false);
        this.problem = problem;
    }

    public Problem problem() {
        return problem;
    }
}
