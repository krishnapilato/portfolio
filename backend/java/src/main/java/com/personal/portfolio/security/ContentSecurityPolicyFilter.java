package com.personal.portfolio.security;

import module java.base;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
class ContentSecurityPolicyFilter extends OncePerRequestFilter {

    static final String NONCE = "cspNonce";
    static final String HEADER = "Content-Security-Policy";
    static final String CDN = "https://cdn.jsdelivr.net";

    private static final SecureRandom RANDOM = new SecureRandom();

    static String policy(String nonce) {
        return String.join("; ",
            "default-src 'self'",
            "script-src 'self' 'nonce-%s' %s".formatted(nonce, CDN),
            "style-src 'self' 'unsafe-inline' " + CDN,
            "img-src 'self' data:",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        var nonce = new byte[18];
        RANDOM.nextBytes(nonce);
        var value = Base64.getEncoder().encodeToString(nonce);
        request.setAttribute(NONCE, value);
        response.setHeader(HEADER, policy(value));
        chain.doFilter(request, response);
    }
}
