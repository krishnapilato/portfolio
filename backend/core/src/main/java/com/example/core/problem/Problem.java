package com.example.core.problem;

import module java.base;

import org.springframework.http.HttpStatus;

/// What went wrong, in terms a client can act on. A service adds a kind of problem by writing a record that
/// implements this: the type of the response is the record's name, so nothing else has to change.
public interface Problem {

    HttpStatus status();

    String title();

    String detail();

    default Map<String, Object> properties() {
        return Map.of();
    }
}
