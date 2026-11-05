package com.example.application.security;

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

    static final String HEADER = "Content-Security-Policy";
    static final String POLICY = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
        + "object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        // Swagger UI positions its controls with inline styles. The application pages need none.
        var documentation = request.getServletPath().startsWith("/swagger-ui/");
        response.setHeader(HEADER, documentation ? POLICY.replace("style-src 'self'", "style-src 'self' 'unsafe-inline'") : POLICY);
        chain.doFilter(request, response);
    }
}
