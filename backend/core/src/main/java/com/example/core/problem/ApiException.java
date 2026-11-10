package com.example.core.problem;

import module java.base;

import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public final class ApiException extends ErrorResponseException {

    @Serial
    private static final long serialVersionUID = 1L;

    private static final Pattern WORD_BOUNDARY = Pattern.compile("(?<=[a-z0-9])(?=[A-Z])");

    public ApiException(Problem problem) {
        super(problem.status(), describe(problem), null);
    }

    private static ProblemDetail describe(Problem problem) {
        var name = problem.getClass().getSimpleName();
        var detail = ProblemDetail.forStatusAndDetail(problem.status(), problem.detail());
        detail.setTitle(problem.title());
        detail.setType(URI.create("urn:problem:" + WORD_BOUNDARY.matcher(name).replaceAll("-").toLowerCase(Locale.ROOT)));
        problem.properties().forEach(detail::setProperty);
        return detail;
    }
}
