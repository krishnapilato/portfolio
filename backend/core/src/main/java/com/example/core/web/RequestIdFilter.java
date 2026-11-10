package com.example.core.web;

import module java.base;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    static final String KEY = "requestId";

    // A client-supplied id is reused only if it is short and plain, so it is safe to log and echo back.
    private static final Pattern ACCEPTED = Pattern.compile("[A-Za-z0-9._-]{8,64}");

    private final Clock clock;

    public static Optional<String> current() {
        return Optional.ofNullable(MDC.get(KEY));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        var inbound = request.getHeader(HEADER);
        var id = inbound != null && ACCEPTED.matcher(inbound).matches() ? inbound : UUID.ofEpochMillis(clock.millis()).toString();
        response.setHeader(HEADER, id);
        MDC.put(KEY, id);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(KEY);
        }
    }
}
