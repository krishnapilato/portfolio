package com.personal.portfolio.platform;

import java.io.Serial;
import java.util.Objects;

public final class ApiException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    private final transient Problem problem;

    public ApiException(Problem problem) {
        this.problem = Objects.requireNonNull(problem);
        super(problem.toString(), null, false, false);
    }

    public Problem problem() {
        return problem;
    }
}
