package com.example.core.problem;

import module java.base;

import com.example.core.web.RequestIdFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RequiredArgsConstructor
@RestControllerAdvice(annotations = RestController.class)
class ProblemHandler extends ResponseEntityExceptionHandler {

    private final Clock clock;

    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleAccessDenied(AccessDeniedException exception, WebRequest request) {
        return respond(exception, HttpStatus.FORBIDDEN, "Access denied", "You are not allowed to perform this operation", request);
    }

    // The response never carries the exception message: it can hold credentials or internal addresses.
    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleUnexpected(Exception exception, WebRequest request) {
        log.atError().addKeyValue("exceptionType", exception.getClass().getName()).log("An unexpected error occurred");
        return respond(exception, HttpStatus.INTERNAL_SERVER_ERROR, "Internal error", "An unexpected error occurred", request);
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
        MethodArgumentNotValidException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        var errors = new TreeMap<String, String>();
        for (FieldError error : exception.getBindingResult().getFieldErrors())
            errors.putIfAbsent(error.getField(), Objects.requireNonNullElse(error.getDefaultMessage(), "is invalid"));
        exception.getBody().setProperty("errors", errors);
        return handleExceptionInternal(exception, exception.getBody(), headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
        @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail problem) {
            RequestIdFilter.current().ifPresent(id -> problem.setProperty("requestId", id));
            problem.setProperty("timestamp", clock.instant());
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    private @Nullable ResponseEntity<Object> respond(
        Exception exception, HttpStatus status, String title, String detail, WebRequest request) {
        var body = ProblemDetail.forStatusAndDetail(status, detail);
        body.setTitle(title);
        return handleExceptionInternal(exception, body, new HttpHeaders(), status, request);
    }
}
