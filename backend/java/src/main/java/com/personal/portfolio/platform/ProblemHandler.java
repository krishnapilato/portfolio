package com.personal.portfolio.platform;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.LOCKED;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import com.personal.portfolio.platform.Problem.AccountUnavailable;
import com.personal.portfolio.platform.Problem.EmailTaken;
import com.personal.portfolio.platform.Problem.IllegalTransition;
import com.personal.portfolio.platform.Problem.InvalidCredentials;
import com.personal.portfolio.platform.Problem.InvalidToken;
import com.personal.portfolio.platform.Problem.LastAdministrator;
import com.personal.portfolio.platform.Problem.MailNotModifiable;
import com.personal.portfolio.platform.Problem.NotFound;
import com.personal.portfolio.platform.Problem.RateLimited;
import com.personal.portfolio.platform.Problem.SelfManagement;
import com.personal.portfolio.platform.Problem.TemporarilyLocked;
import com.personal.portfolio.platform.Problem.TokenReuse;
import com.personal.portfolio.platform.Problem.UnsupportedSort;
import com.personal.portfolio.platform.Problem.WrongPassword;
import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RequiredArgsConstructor
@RestControllerAdvice(annotations = RestController.class)
class ProblemHandler extends ResponseEntityExceptionHandler {

    private static final String TYPE_PREFIX = "urn:problem:";
    private static final Pattern WORD_BOUNDARY = Pattern.compile("(?<=[a-z0-9])(?=[A-Z])");

    private final Clock clock;

    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleApiException(ApiException exception, WebRequest request) {
        return respond(exception, describe(exception), request);
    }

    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleDataIntegrityViolation(
            DataIntegrityViolationException exception, WebRequest request) {
        return respond(exception, problem(exception, CONFLICT, "Conflict",
                "The request conflicts with data that already exists")
                .type(typeOf("conflict")), request);
    }

    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleOptimisticLockingFailure(
            OptimisticLockingFailureException exception, WebRequest request) {
        return respond(exception, problem(exception, CONFLICT, "Concurrent modification",
                "The resource was modified by another request; reload it and try again")
                .type(typeOf("concurrent-modification")), request);
    }

    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleAccessDenied(AccessDeniedException exception, WebRequest request) {
        return respond(exception, problem(exception, FORBIDDEN, "Access denied",
                "You are not allowed to perform this operation")
                .type(typeOf("access-denied")), request);
    }

    @ExceptionHandler
    @Nullable ResponseEntity<Object> handleUnexpected(Exception exception, WebRequest request) {
        log.error("An unexpected error occurred", exception);
        return respond(exception, problem(exception, INTERNAL_SERVER_ERROR, "Internal error",
                "An unexpected error occurred")
                .type(typeOf("internal-error")), request);
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        var errors = exception.getBindingResult().getAllErrors().stream()
                .collect(Collectors.toMap(ProblemHandler::fieldOf, ProblemHandler::messageOf,
                        (first, _) -> first, TreeMap::new));
        return validationFailed(exception, errors, headers, status, request);
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        var errors = new TreeMap<String, String>();
        exception.getParameterValidationResults().forEach(result -> result.getResolvableErrors()
                .forEach(error -> errors.putIfAbsent(fieldOf(result, error), messageOf(error))));
        return validationFailed(exception, errors, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
            @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail problem) {
            CorrelationFilter.current().ifPresent(id -> problem.setProperty("requestId", id));
            problem.setProperty("timestamp", clock.instant());
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    private ErrorResponse.Builder describe(ApiException exception) {
        var response = switch (exception.problem()) {
            case NotFound(var resource, var key) -> problem(exception, NOT_FOUND, "Resource not found",
                    "%s '%s' does not exist".formatted(resource, key));
            case EmailTaken(var email) -> problem(exception, CONFLICT, "Email already registered",
                    "An account for %s already exists".formatted(email));
            case InvalidCredentials() -> problem(exception, UNAUTHORIZED, "Invalid credentials",
                    "The email or password is incorrect");
            case AccountUnavailable(var status) -> problem(exception, FORBIDDEN, "Account unavailable",
                    "The account is %s".formatted(label(status)));
            case TemporarilyLocked(var until) -> problem(exception, LOCKED, "Account temporarily locked",
                    "Too many failed sign-in attempts; try again later")
                    .property("lockedUntil", until)
                    .header(HttpHeaders.RETRY_AFTER, Long.toString(secondsUntil(until)));
            case RateLimited(var until) -> problem(exception, TOO_MANY_REQUESTS, "Too many requests",
                    "Too many authentication requests from this client; try again later")
                    .header(HttpHeaders.RETRY_AFTER, Long.toString(secondsUntil(until)));
            case InvalidToken(var purpose) -> problem(exception, BAD_REQUEST, "Invalid or expired token",
                    "The %s token is invalid or has expired".formatted(label(purpose)));
            case TokenReuse() -> problem(exception, UNAUTHORIZED, "Refresh token reuse detected",
                    "The session was revoked for safety; sign in again");
            case IllegalTransition(var from, var to) -> problem(exception, CONFLICT, "Illegal status transition",
                    "An account cannot move from %s to %s".formatted(label(from), label(to)));
            case SelfManagement() -> problem(exception, CONFLICT, "Self management not allowed",
                    "Administrators cannot change their own role or status, nor delete their own account");
            case LastAdministrator() -> problem(exception, CONFLICT, "Last administrator",
                    "At least one active administrator must remain");
            case WrongPassword() -> problem(exception, BAD_REQUEST, "Current password is incorrect",
                    "The current password does not match");
            case UnsupportedSort(var property, var allowed) -> problem(exception, BAD_REQUEST,
                    "Unsupported sort property", "Sorting by '%s' is not supported".formatted(property))
                    .property("allowed", new TreeSet<>(allowed));
            case MailNotModifiable(var id, var status) -> problem(exception, CONFLICT,
                    "Message can no longer be modified", "Message %d is %s".formatted(id, label(status)));
        };
        var name = exception.problem().getClass().getSimpleName();
        return response.type(typeOf(WORD_BOUNDARY.matcher(name).replaceAll("-").toLowerCase(Locale.ROOT)));
    }

    private @Nullable ResponseEntity<Object> validationFailed(Exception exception, SortedMap<String, String> errors,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        var body = problem(exception, BAD_REQUEST, "Validation failed",
                "The request contains %d invalid field(s)".formatted(errors.size()))
                .type(typeOf("validation-failed"))
                .property("errors", errors)
                .build()
                .getBody();
        return handleExceptionInternal(exception, body, headers, status, request);
    }

    private @Nullable ResponseEntity<Object> respond(
            Exception exception, ErrorResponse.Builder problem, WebRequest request) {
        var response = problem.build();
        return handleExceptionInternal(exception, response.getBody(), response.getHeaders(),
                response.getStatusCode(), request);
    }

    private long secondsUntil(Instant instant) {
        return Math.max(1, Math.ceilDiv(Duration.between(clock.instant(), instant).toMillis(), 1_000));
    }

    private static ErrorResponse.Builder problem(Exception exception, HttpStatus status, String title, String detail) {
        return ErrorResponse.builder(exception, status, detail).title(title);
    }

    private static URI typeOf(String slug) {
        return URI.create(TYPE_PREFIX + slug);
    }

    private static String label(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT).replace('_', ' ');
    }

    private static String fieldOf(ObjectError error) {
        return error instanceof FieldError field ? field.getField() : error.getObjectName();
    }

    private static String fieldOf(ParameterValidationResult result, MessageSourceResolvable error) {
        return error instanceof ObjectError objectError
                ? fieldOf(objectError)
                : Objects.requireNonNullElse(result.getMethodParameter().getParameterName(), "request");
    }

    private static String messageOf(MessageSourceResolvable error) {
        return Objects.requireNonNullElse(error.getDefaultMessage(), "is invalid");
    }
}
