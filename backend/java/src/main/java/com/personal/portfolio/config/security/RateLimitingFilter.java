package com.personal.portfolio.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, RateLimitRule> endpointRules = Map.of(
            "/auth/", new RateLimitRule(5, Duration.ofMinutes(1)),
            "/api/email/", new RateLimitRule(3, Duration.ofMinutes(1)),
            "default", new RateLimitRule(10, Duration.ofMinutes(1))
    );

    private final Cache<String, BucketInfo> buckets = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String key = resolveKey(request);
        BucketInfo bucketInfo = buckets.get(key, k -> createBucketForRequest(request));
        assert bucketInfo != null;
        Bucket bucket = bucketInfo.bucket();

        if (bucket.tryConsume(1)) {
            addRateLimitHeaders(response, bucketInfo);
            filterChain.doFilter(request, response);
        } else {
            sendRateLimitError(response, bucketInfo);
        }
    }

    private String resolveKey(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String category = endpointRules.keySet().stream()
                .filter(prefix -> request.getRequestURI().startsWith(prefix))
                .findFirst()
                .orElse("default");
        return ip + ":" + category;
    }

    private BucketInfo createBucketForRequest(HttpServletRequest request) {
        RateLimitRule rule = endpointRules.keySet().stream()
                .filter(prefix -> request.getRequestURI().startsWith(prefix))
                .map(endpointRules::get)
                .findFirst()
                .orElse(endpointRules.get("default"));

        Bandwidth limit = Bandwidth.classic(rule.capacity(), Refill.greedy(rule.capacity(), rule.refillDuration()));
        Bucket bucket = Bucket.builder().addLimit(limit).build();

        return new BucketInfo(bucket, rule.capacity(), rule.refillDuration());
    }

    private void addRateLimitHeaders(HttpServletResponse response, BucketInfo bucketInfo) {
        long available = bucketInfo.bucket().getAvailableTokens();
        response.setHeader("X-RateLimit-Limit", String.valueOf(bucketInfo.capacity()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(available));
        response.setHeader("X-RateLimit-Reset", String.valueOf(bucketInfo.refillDuration().getSeconds()));
    }

    private void sendRateLimitError(HttpServletResponse response, BucketInfo bucketInfo) throws IOException {
        long resetSeconds = bucketInfo.refillDuration().getSeconds();

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(resetSeconds));
        response.setContentType("application/json");

        Map<String, Object> errorBody = Map.of(
                "error", "too_many_requests",
                "message", "Too many requests - slow down!",
                "retry_after_seconds", resetSeconds
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorBody));
    }

    private record RateLimitRule(int capacity, Duration refillDuration) {
    }

    private record BucketInfo(Bucket bucket, int capacity, Duration refillDuration) {
    }
}