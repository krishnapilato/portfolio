package com.personal.portfolio.platform;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class CorrelationFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    // Name of the log MDC key and of the request attribute that templates/error.html shows.
    static final String ATTRIBUTE = "requestId";
    static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

    // A client-supplied id is reused only if it is short and plain, so it is safe to log and echo back.
    private static final Pattern ACCEPTED = Pattern.compile("[A-Za-z0-9._-]{8,64}");
    // Probes and scrapes hit these every few seconds: they are logged only when they fail.
    private static final List<String> QUIET_PATHS = List.of("/actuator/", "/favicon");

    private final Clock clock;

    public static Optional<String> current() {
        return REQUEST_ID.isBound() ? Optional.of(REQUEST_ID.get()) : Optional.empty();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var id = resolve(request.getHeader(HEADER));
        response.setHeader(HEADER, id);
        request.setAttribute(ATTRIBUTE, id);
        MDC.put(ATTRIBUTE, id);
        var started = System.nanoTime();
        try {
            ScopedValue.where(REQUEST_ID, id).call(() -> {
                chain.doFilter(request, response);
                return null;
            });
        } catch (IOException | ServletException | RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new ServletException(e);
        } finally {
            var path = request.getRequestURI();
            var status = response.getStatus();
            if (status >= 400 || QUIET_PATHS.stream().noneMatch(path::startsWith)) {
                log.info("{} {} -> {} ({} ms)", request.getMethod(), path, status,
                        TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started));
            }
            MDC.remove(ATTRIBUTE);
        }
    }

    private String resolve(@Nullable String inbound) {
        return inbound != null && ACCEPTED.matcher(inbound).matches()
                ? inbound
                : UUID.ofEpochMillis(clock.millis()).toString();
    }
}
