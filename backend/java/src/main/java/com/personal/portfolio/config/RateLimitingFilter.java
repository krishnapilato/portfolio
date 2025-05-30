package com.personal.portfolio.config;

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
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Hold bucket + metadata together
    private static class BucketInfo {
        Bucket bucket;
        long capacity;
        Duration refillDuration;

        BucketInfo(Bucket bucket, long capacity, Duration refillDuration) {
            this.bucket = bucket;
            this.capacity = capacity;
            this.refillDuration = refillDuration;
        }
    }

    private final Map<String, BucketInfo> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String key = resolveKey(request);
        BucketInfo bucketInfo = buckets.computeIfAbsent(key, k -> createBucketForRequest(request));
        Bucket bucket = bucketInfo.bucket;

        if (bucket.tryConsume(1)) {
            addRateLimitHeaders(response, bucketInfo);
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(bucketInfo.refillDuration.getSeconds()));
            response.getWriter().write("Too many requests - slow down! Try again in one minute");
        }
    }

    private String resolveKey(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String endpointCategory;

        if (request.getRequestURI().startsWith("/auth/")) {
            endpointCategory = "auth";
        } else if (request.getRequestURI().startsWith("/api/email/")) {
            endpointCategory = "email";
        } else {
            endpointCategory = "general";
        }

        return ip + ":" + endpointCategory;
    }

    private BucketInfo createBucketForRequest(HttpServletRequest request) {
        if (request.getRequestURI().startsWith("/auth/")) {
            return createBucketWithInfo(5, Duration.ofMinutes(1));
        } else if (request.getRequestURI().startsWith("/api/email/")) {
            return createBucketWithInfo(3, Duration.ofMinutes(1));
        } else {
            return createBucketWithInfo(10, Duration.ofMinutes(1));
        }
    }

    private BucketInfo createBucketWithInfo(int capacity, Duration refillDuration) {
        Bandwidth limit = Bandwidth.classic(capacity, Refill.greedy(capacity, refillDuration));
        return new BucketInfo(Bucket.builder().addLimit(limit).build(), capacity, refillDuration);
    }

    private void addRateLimitHeaders(HttpServletResponse response, BucketInfo bucketInfo) {
        long available = bucketInfo.bucket.getAvailableTokens();

        response.setHeader("X-RateLimit-Limit", String.valueOf(bucketInfo.capacity));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(available));
        response.setHeader("X-RateLimit-Reset", String.valueOf(bucketInfo.refillDuration.getSeconds()));
    }
}