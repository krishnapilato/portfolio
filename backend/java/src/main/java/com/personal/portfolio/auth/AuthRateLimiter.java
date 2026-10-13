package com.personal.portfolio.auth;

import module java.base;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.Problem.RateLimited;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Counts live in the database, so the limit holds across every instance of the service.
// The client address is the TCP peer, or a forwarded one only when it comes from a trusted proxy.
@Component
class AuthRateLimiter implements HandlerInterceptor, WebMvcConfigurer {

    private static final Duration WINDOW = Duration.ofMinutes(1);

    // One atomic statement per request: it opens a window, counts within it, or starts a new one once it has ended.
    // "requests" is assigned before "window_end_ms" on purpose, because MySQL applies the assignments in order.
    private static final String COUNT = """
        insert into auth_rate_limits (client, window_end_ms, requests) values (:client, :end, 1)
        on duplicate key update
            requests = case when window_end_ms > :now then requests + 1 else 1 end,
            window_end_ms = case when window_end_ms > :now then window_end_ms else :end end
        """;

    private final AppProperties properties;
    private final Clock clock;
    private final JdbcClient jdbc;

    AuthRateLimiter(AppProperties properties, Clock clock, JdbcClient jdbc) {
        this.properties = properties;
        this.clock = clock;
        this.jdbc = jdbc;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/*/auth/**");
    }

    @Override
    public boolean preHandle(HttpServletRequest req, @NonNull HttpServletResponse res, @NonNull Object handler) {
        var client = req.getRemoteAddr();
        var now = clock.instant().toEpochMilli();
        jdbc.sql(COUNT).param("client", client).param("now", now).param("end", now + WINDOW.toMillis()).update();
        var window = jdbc.sql("select requests, window_end_ms from auth_rate_limits where client = :client")
            .param("client", client)
            .query((row, _) -> new Window(row.getInt(1), Instant.ofEpochMilli(row.getLong(2))))
            .single();
        if (window.requests() > properties.security().authRequestsPerMinute()) throw new ApiException(new RateLimited(window.end()));
        return true;
    }

    @Scheduled(cron = "0 11 * * * *")
    public int purgeExpired() {
        return jdbc.sql("delete from auth_rate_limits where window_end_ms <= :now").param("now", clock.instant().toEpochMilli()).update();
    }

    private record Window(int requests, Instant end) {}
}
