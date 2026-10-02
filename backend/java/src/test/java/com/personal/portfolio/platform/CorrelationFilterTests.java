package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.personal.portfolio.support.IntegrationTest;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.slf4j.MDC;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

@ExtendWith(OutputCaptureExtension.class)
class CorrelationFilterTests extends IntegrationTest {

    private static final String HEADER = CorrelationFilter.HEADER;
    private static final Instant NOW = Instant.parse("2026-09-30T08:15:30.123Z");

    private final CorrelationFilter filter = new CorrelationFilter(Clock.fixed(NOW, ZoneOffset.UTC));

    @ParameterizedTest
    @ValueSource(strings = {"client-trace-0001", "abcdefgh", "01999a4e-3c1b-7d2e-8f00-123456789abc",
            "Trace.ID_with-every.allowed_char-0123456789-ABCDEFGHIJKLMNOPQRST"})
    void echoesAWellFormedInboundRequestId(String inbound) {
        assertThat(mvc.get().uri("/").header(HEADER, inbound))
                .hasStatusOk()
                .hasHeader(HEADER, inbound);
    }

    @ParameterizedTest
    @ValueSource(strings = {"short", "has spaces inside", "semi;colon-0001", "quote\"injection", "café-latte-01",
            "a-sixty-five-character-request-id-is-one-character-too-long-00001"})
    void replacesAMalformedInboundRequestIdWithAVersion7Uuid(String inbound) {
        var response = mvc.get().uri("/").header(HEADER, inbound).exchange().getResponse();

        assertThat(response.getHeader(HEADER)).isNotEqualTo(inbound).satisfies(id -> assertVersion7(id));
    }

    @Test
    void generatesAVersion7UuidWhenNoRequestIdIsSent() {
        var response = mvc.get().uri("/").exchange().getResponse();

        assertVersion7(response.getHeader(HEADER));
    }

    @ParameterizedTest(name = "{0} {1} -> {2}")
    @CsvSource({
            "GET, /, 200",
            "GET, /favicon.svg, 200",
            "GET, /actuator/health, 200",
            "GET, /actuator/metrics, 401",
            "GET, /api/v1/users, 401",
            "GET, /missing-page, 401",
            "POST, /api/v1/auth/login, 400",
            "DELETE, /, 405"})
    void stampsEveryResponseWithARequestId(String method, String path, int status) {
        var response = mvc.method(HttpMethod.valueOf(method)).uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .exchange()
                .getResponse();

        assertThat(response.getStatus()).isEqualTo(status);
        assertVersion7(response.getHeader(HEADER));
    }

    @Test
    void stampsForbiddenAndNotFoundResponses() {
        assertThat(mvc.get().uri("/actuator/env").with(user(1)).header(HEADER, "forbidden-trace-01"))
                .hasStatus(HttpStatus.FORBIDDEN)
                .hasHeader(HEADER, "forbidden-trace-01");
        assertThat(mvc.get().uri("/missing-page").with(admin()).header(HEADER, "not-found-trace-01"))
                .hasStatus(HttpStatus.NOT_FOUND)
                .hasHeader(HEADER, "not-found-trace-01");
    }

    @Test
    void sharesTheRequestIdWithProblemDetails() {
        assertThat(mvc.get().uri("/api/v1/users/{id}", Long.MAX_VALUE - 1).with(admin())
                .header(HEADER, "problem-trace-0001"))
                .hasStatus(HttpStatus.NOT_FOUND)
                .hasHeader(HEADER, "problem-trace-0001")
                .bodyJson()
                .extractingPath("$.requestId")
                .isEqualTo("problem-trace-0001");
    }

    @Test
    void logsOneAccessLineForApplicationRequests(CapturedOutput output) {
        var id = "access-log-" + UUID.randomUUID();

        assertThat(mvc.get().uri("/").header(HEADER, id)).hasStatusOk();

        assertThat(output.getOut().lines().filter(line -> line.contains(id)))
                .singleElement()
                .asString()
                .contains("GET / -> 200 (");
    }

    @ParameterizedTest
    @ValueSource(strings = {"/actuator/health", "/favicon.svg"})
    void keepsInfrastructureRequestsOutOfTheAccessLog(String path, CapturedOutput output) {
        var id = "quiet-path-" + UUID.randomUUID();

        assertThat(mvc.get().uri(path).header(HEADER, id)).hasStatusOk();

        assertThat(output.getOut()).doesNotContain(id);
    }

    @Test
    void logsFailedRequestsEvenOnQuietPaths(CapturedOutput output) {
        var id = "quiet-failure-" + UUID.randomUUID();

        assertThat(mvc.get().uri("/actuator/env").header(HEADER, id)).hasStatus(HttpStatus.UNAUTHORIZED);

        assertThat(output.getOut().lines().filter(line -> line.contains(id)))
                .singleElement()
                .asString()
                .contains("GET /actuator/env -> 401 (");
    }

    @ParameterizedTest(name = "{0} -> {1} logged: {2}")
    @CsvSource({
            "/api/v1/me, 200, true",
            "/api/v1/me, 500, true",
            "/actuator/health, 200, false",
            "/actuator/health, 503, true",
            "/favicon.svg, 200, false",
            "/favicon.svg, 404, true"})
    void writesOneAccessLineUnlessAQuietPathSucceeded(String path, int status, boolean logged, CapturedOutput output)
            throws Exception {
        var id = "unit-log-" + UUID.randomUUID();
        var request = new MockHttpServletRequest("GET", path);
        request.addHeader(HEADER, id);

        filter.doFilter(request, new MockHttpServletResponse(),
                (_, response) -> ((MockHttpServletResponse) response).setStatus(status));

        assertThat(output.getOut().contains(id)).isEqualTo(logged);
    }

    @ParameterizedTest(name = "{0} -> {1} logged: {2}")
    @CsvSource({
            "/api/v1/me, 200, true",
            "/actuator/health, 200, false",
            "/actuator/health, 503, true"})
    void decidesTheAccessLineTheSameWayWhenTheChainFails(String path, int status, boolean logged,
            CapturedOutput output) {
        var id = "chain-failure-" + UUID.randomUUID();
        var request = new MockHttpServletRequest("GET", path);
        request.addHeader(HEADER, id);

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> filter.doFilter(request, new MockHttpServletResponse(), (_, response) -> {
                    ((MockHttpServletResponse) response).setStatus(status);
                    throw new IllegalStateException("handler exploded");
                }));

        assertThat(output.getOut().contains(id)).isEqualTo(logged);
    }

    @Test
    void bindsTheRequestIdOnlyWhileTheChainRuns() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/me");
        request.addHeader(HEADER, "scoped-value-0001");
        var response = new MockHttpServletResponse();
        var scoped = new AtomicReference<Optional<String>>();
        var logged = new AtomicReference<@Nullable String>();

        filter.doFilter(request, response, (_, _) -> {
            scoped.set(CorrelationFilter.current());
            logged.set(MDC.get("requestId"));
        });

        assertThat(scoped.get()).contains("scoped-value-0001");
        assertThat(logged.get()).isEqualTo("scoped-value-0001");
        assertThat(response.getHeader(HEADER)).isEqualTo("scoped-value-0001");
        assertThat(request.getAttribute(CorrelationFilter.ATTRIBUTE)).isEqualTo("scoped-value-0001");
        assertThat(CorrelationFilter.current()).isEmpty();
        assertThat(MDC.get("requestId")).isNull();
    }

    @Test
    void derivesGeneratedIdsFromTheClock() throws Exception {
        var response = new MockHttpServletResponse();

        filter.doFilter(new MockHttpServletRequest("GET", "/"), response, (_, _) -> { });

        var id = UUID.fromString(response.getHeader(HEADER));
        assertThat(id.version()).isEqualTo(7);
        assertThat(id.getMostSignificantBits() >>> 16).isEqualTo(NOW.toEpochMilli());
    }

    @Test
    void propagatesIoFailuresAndCleansUp() {
        assertThatExceptionOfType(IOException.class)
                .isThrownBy(() -> filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(),
                        (_, _) -> {
                            throw new IOException("client went away");
                        }))
                .withMessage("client went away");
        assertThat(MDC.get("requestId")).isNull();
    }

    @Test
    void propagatesServletFailuresAndCleansUp() {
        assertThatExceptionOfType(ServletException.class)
                .isThrownBy(() -> filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(),
                        (_, _) -> {
                            throw new ServletException("dispatch failed");
                        }))
                .withMessage("dispatch failed");
        assertThat(MDC.get("requestId")).isNull();
    }

    @Test
    void propagatesRuntimeFailuresAndCleansUp() {
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(),
                        (_, _) -> {
                            throw new IllegalStateException("handler exploded");
                        }))
                .withMessage("handler exploded");
        assertThat(MDC.get("requestId")).isNull();
        assertThat(CorrelationFilter.current()).isEmpty();
    }

    private static void assertVersion7(@Nullable String id) {
        assertThat(id).isNotNull();
        assertThat(UUID.fromString(id)).satisfies(uuid -> {
            assertThat(uuid.version()).isEqualTo(7);
            assertThat(uuid.variant()).isEqualTo(2);
            assertThat(uuid.toString()).isEqualTo(id);
        });
    }
}
