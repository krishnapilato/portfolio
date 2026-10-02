package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import com.personal.portfolio.auth.TokenPurpose;
import com.personal.portfolio.mail.MailStatus;
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
import com.personal.portfolio.user.AccountStatus;
import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;

class ProblemHandlerTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:00:00Z");
    private static final Instant LOCKED_UNTIL = NOW.plus(Duration.ofSeconds(90));
    private static final String REQUEST_ID = "req-problem-0001";
    private static final String LEAKED_SECRET = "jdbc:mysql://db.internal:3306/portfolio?password=hunter2";

    private final ProblemHandler handler = new ProblemHandler(Clock.fixed(NOW, ZoneOffset.UTC));

    static Stream<Arguments> problems() {
        return Stream.of(
                arguments(new NotFound("User", 42L), HttpStatus.NOT_FOUND, "not-found", "Resource not found",
                        "User '42' does not exist", Map.of()),
                arguments(new EmailTaken("ada@portfolio.local"), HttpStatus.CONFLICT, "email-taken",
                        "Email already registered", "An account for ada@portfolio.local already exists", Map.of()),
                arguments(new InvalidCredentials(), HttpStatus.UNAUTHORIZED, "invalid-credentials",
                        "Invalid credentials",
                        "The email or password is incorrect, or the account is locked after too many failed attempts",
                        Map.of()),
                arguments(new AccountUnavailable(AccountStatus.DISABLED), HttpStatus.FORBIDDEN, "account-unavailable",
                        "Account unavailable", "The account is disabled", Map.of()),
                arguments(new TemporarilyLocked(LOCKED_UNTIL), HttpStatus.LOCKED, "temporarily-locked",
                        "Account temporarily locked", "Too many failed sign-in attempts; try again later",
                        Map.of("lockedUntil", LOCKED_UNTIL)),
                arguments(new RateLimited(LOCKED_UNTIL), HttpStatus.TOO_MANY_REQUESTS, "rate-limited",
                        "Too many requests", "Too many authentication requests from this client; try again later",
                        Map.of()),
                arguments(new InvalidToken(TokenPurpose.PASSWORD_RESET), HttpStatus.BAD_REQUEST, "invalid-token",
                        "Invalid or expired token", "The password reset token is invalid or has expired", Map.of()),
                arguments(new TokenReuse(), HttpStatus.UNAUTHORIZED, "token-reuse", "Refresh token reuse detected",
                        "The session was revoked for safety; sign in again", Map.of()),
                arguments(new IllegalTransition(AccountStatus.DISABLED, AccountStatus.LOCKED), HttpStatus.CONFLICT,
                        "illegal-transition", "Illegal status transition",
                        "An account cannot move from disabled to locked", Map.of()),
                arguments(new SelfManagement(), HttpStatus.CONFLICT, "self-management", "Self management not allowed",
                        "Administrators cannot change their own role or status, nor delete their own account",
                        Map.of()),
                arguments(new LastAdministrator(), HttpStatus.CONFLICT, "last-administrator", "Last administrator",
                        "At least one active administrator must remain", Map.of()),
                arguments(new WrongPassword(), HttpStatus.BAD_REQUEST, "wrong-password",
                        "Current password is incorrect", "The current password does not match", Map.of()),
                arguments(new UnsupportedSort("passwordHash", Set.of("email", "createdAt", "fullName")),
                        HttpStatus.BAD_REQUEST, "unsupported-sort", "Unsupported sort property",
                        "Sorting by 'passwordHash' is not supported",
                        Map.of("allowed", Set.of("createdAt", "email", "fullName"))),
                arguments(new MailNotModifiable(7L, MailStatus.SENT), HttpStatus.CONFLICT, "mail-not-modifiable",
                        "Message can no longer be modified", "Message 7 is sent", Map.of()));
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @MethodSource("problems")
    void mapsEveryProblemToItsProblemDetail(Problem problem, HttpStatus status, String slug, String title,
            String detail, Map<String, Object> extras) {
        var response = withRequestId(() -> handler.handleApiException(new ApiException(problem), webRequest()));

        assertThat(response.getStatusCode()).isEqualTo(status);
        assertThat(problemOf(response)).satisfies(body -> {
            assertThat(body.getStatus()).isEqualTo(status.value());
            assertThat(body.getType()).isEqualTo(URI.create("urn:problem:" + slug));
            assertThat(body.getTitle()).isEqualTo(title);
            assertThat(body.getDetail()).isEqualTo(detail);
            assertThat(body.getProperties())
                    .containsEntry("requestId", REQUEST_ID)
                    .containsEntry("timestamp", NOW)
                    .containsAllEntriesOf(extras)
                    .hasSize(extras.size() + 2);
        });
    }

    @Test
    void coversEveryPermittedProblemType() {
        List<Class<?>> mapped = problems().<Class<?>>map(row -> row.get()[0].getClass()).toList();

        assertThat(mapped).doesNotHaveDuplicates().containsExactlyInAnyOrder(Problem.class.getPermittedSubclasses());
    }

    @ParameterizedTest(name = "locked for {0} -> Retry-After {1}")
    @MethodSource("lockDurations")
    void announcesWhenALockedAccountMayRetry(Duration remaining, String retryAfter) {
        var response = handle(new TemporarilyLocked(NOW.plus(remaining)));

        assertThat(response.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo(retryAfter);
    }

    @ParameterizedTest(name = "limited for {0} -> Retry-After {1}")
    @MethodSource("lockDurations")
    void announcesWhenARateLimitedClientMayRetry(Duration remaining, String retryAfter) {
        var response = handle(new RateLimited(NOW.plus(remaining)));

        assertThat(response.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo(retryAfter);
    }

    static Stream<Arguments> lockDurations() {
        return Stream.of(
                arguments(Duration.ofSeconds(90), "90"),
                arguments(Duration.ofMillis(1_500), "2"),
                arguments(Duration.ofMillis(1), "1"),
                arguments(Duration.ZERO, "1"),
                arguments(Duration.ofMinutes(-5), "1"));
    }

    @Test
    void omitsTheRetryAfterHeaderForOtherProblems() {
        assertThat(handle(new InvalidCredentials()).getHeaders().containsHeader(HttpHeaders.RETRY_AFTER)).isFalse();
    }

    @Test
    void listsTheAllowedSortPropertiesInAlphabeticalOrder() {
        var response = handle(new UnsupportedSort("secret", Set.of("status", "email", "role", "createdAt")));

        assertThat(problemOf(response).getProperties())
                .extractingByKey("allowed")
                .asInstanceOf(InstanceOfAssertFactories.iterable(String.class))
                .containsExactly("createdAt", "email", "role", "status");
    }

    @Test
    void omitsTheRequestIdOutsideOfACorrelatedRequest() {
        var body = problemOf(handle(new WrongPassword()));

        assertThat(body.getProperties()).containsOnlyKeys("timestamp").containsEntry("timestamp", NOW);
    }

    @Test
    void reportsEveryInvalidFieldOfAValidationFailure() throws Exception {
        var binding = new BeanPropertyBindingResult(new Object(), "registration");
        binding.addError(new FieldError("registration", "password", "size must be between 10 and 128"));
        binding.addError(new FieldError("registration", "email", "must be a well-formed email address"));
        binding.addError(new FieldError("registration", "email", "must not be blank"));
        binding.addError(new ObjectError("registration", null, null, null));
        var parameter = new MethodParameter(Object.class.getMethod("equals", Object.class), 0);
        var exception = new MethodArgumentNotValidException(parameter, binding);

        var response = withRequestId(() -> handler.handleException(exception, webRequest()));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(problemOf(response)).satisfies(body -> {
            assertThat(body.getType()).isEqualTo(URI.create("urn:problem:validation-failed"));
            assertThat(body.getTitle()).isEqualTo("Validation failed");
            assertThat(body.getDetail()).isEqualTo("The request contains 3 invalid field(s)");
            assertThat(body.getProperties())
                    .containsEntry("requestId", REQUEST_ID)
                    .containsEntry("timestamp", NOW)
                    .extractingByKey("errors")
                    .isEqualTo(Map.of(
                            "email", "must be a well-formed email address",
                            "password", "size must be between 10 and 128",
                            "registration", "is invalid"));
        });
    }

    @Test
    void decoratesFrameworkProblemsWithCorrelationProperties() throws Exception {
        var exception = new HttpRequestMethodNotSupportedException("DELETE", List.of("GET", "POST"));

        var response = withRequestId(() -> handler.handleException(exception, webRequest()));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getHeaders().getAllow()).containsExactlyInAnyOrder(HttpMethod.GET, HttpMethod.POST);
        assertThat(problemOf(response).getProperties())
                .containsEntry("requestId", REQUEST_ID)
                .containsEntry("timestamp", NOW);
    }

    @Test
    void passesBodiesOtherThanProblemDetailsThroughUntouched() {
        var response = withRequestId(() -> handler.createResponseEntity("plain body", new HttpHeaders(),
                HttpStatus.ACCEPTED, webRequest()));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
        assertThat(response.getBody()).isEqualTo("plain body");
    }

    static Stream<Arguments> infrastructureFailures() {
        return Stream.of(
                arguments(new DataIntegrityViolationException(LEAKED_SECRET), HttpStatus.CONFLICT, "conflict",
                        "Conflict", "The request conflicts with data that already exists"),
                arguments(new OptimisticLockingFailureException(LEAKED_SECRET), HttpStatus.CONFLICT,
                        "concurrent-modification", "Concurrent modification",
                        "The resource was modified by another request; reload it and try again"),
                arguments(new AccessDeniedException(LEAKED_SECRET), HttpStatus.FORBIDDEN, "access-denied",
                        "Access denied", "You are not allowed to perform this operation"),
                arguments(new IllegalStateException(LEAKED_SECRET), HttpStatus.INTERNAL_SERVER_ERROR,
                        "internal-error", "Internal error", "An unexpected error occurred"));
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @MethodSource("infrastructureFailures")
    void translatesInfrastructureFailuresWithoutLeakingTheirMessage(Exception exception, HttpStatus status,
            String slug, String title, String detail) {
        var response = withRequestId(() -> dispatch(exception));

        assertThat(response.getStatusCode()).isEqualTo(status);
        assertThat(problemOf(response)).satisfies(body -> {
            assertThat(body.getType()).isEqualTo(URI.create("urn:problem:" + slug));
            assertThat(body.getTitle()).isEqualTo(title);
            assertThat(body.getDetail()).isEqualTo(detail);
            assertThat(body.getProperties()).containsOnlyKeys("requestId", "timestamp");
            assertThat(body.toString()).doesNotContain("hunter2");
        });
    }

    private ResponseEntity<Object> dispatch(Exception exception) {
        var request = webRequest();
        return switch (exception) {
            case DataIntegrityViolationException conflict -> handler.handleDataIntegrityViolation(conflict, request);
            case OptimisticLockingFailureException stale -> handler.handleOptimisticLockingFailure(stale, request);
            case AccessDeniedException denied -> handler.handleAccessDenied(denied, request);
            default -> handler.handleUnexpected(exception, request);
        };
    }

    private ResponseEntity<Object> handle(Problem problem) {
        return Objects.requireNonNull(handler.handleApiException(new ApiException(problem), webRequest()));
    }

    private static <X extends Exception> ResponseEntity<Object> withRequestId(
            ScopedValue.CallableOp<ResponseEntity<Object>, X> call) throws X {
        return Objects.requireNonNull(ScopedValue.where(CorrelationFilter.REQUEST_ID, REQUEST_ID).call(call));
    }

    private static ProblemDetail problemOf(ResponseEntity<Object> response) {
        assertThat(response.getBody()).isInstanceOf(ProblemDetail.class);
        return (ProblemDetail) Objects.requireNonNull(response.getBody());
    }

    private static ServletWebRequest webRequest() {
        return new ServletWebRequest(new MockHttpServletRequest(), new MockHttpServletResponse());
    }
}
