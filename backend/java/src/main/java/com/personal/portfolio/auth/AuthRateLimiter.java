package com.personal.portfolio.auth;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.Problem.RateLimited;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/// Allows each client address a fixed number of requests per minute on the public auth endpoints.
/// The address is the TCP peer, or a forwarded one only when it comes from a trusted proxy.
@Component
@RequiredArgsConstructor
class AuthRateLimiter implements HandlerInterceptor, WebMvcConfigurer {

    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final Map<String, Integer> requests = new ConcurrentHashMap<>();
    private final AppProperties properties;
    private final Clock clock;
    private Instant windowEnd = Instant.MIN;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/*/auth/**");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        var resetAt = window(clock.instant());
        if (requests.merge(request.getRemoteAddr(), 1, Integer::sum) > properties.security().authRequestsPerMinute()) {
            throw new ApiException(new RateLimited(resetAt));
        }
        return true;
    }

    private synchronized Instant window(Instant now) {
        if (!now.isBefore(windowEnd)) {
            requests.clear();
            windowEnd = now.plus(WINDOW);
        }
        return windowEnd;
    }
}
