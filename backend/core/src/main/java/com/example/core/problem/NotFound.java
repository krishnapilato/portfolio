package com.example.core.problem;

import org.springframework.http.HttpStatus;

public record NotFound(String resource, Object key) implements Problem {

    @Override
    public HttpStatus status() {
        return HttpStatus.NOT_FOUND;
    }

    @Override
    public String title() {
        return "Resource not found";
    }

    @Override
    public String detail() {
        return "%s '%s' does not exist".formatted(resource, key);
    }
}
