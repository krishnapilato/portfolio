package com.personal.portfolio.config.security;

import com.personal.portfolio.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

/**
 * JWT Authentication Filter to validate and authenticate users based on JWT tokens.
 * Intercepts requests and sets authentication in the SecurityContext if valid.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Define public endpoints that skip JWT authentication checks.
     */
    private static final String[] PUBLIC_ENDPOINT_PREFIXES = {"/auth/", "/api/email/"};

    private static final String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String requestURI = request.getRequestURI();

        if (!isPublicEndpoint(requestURI) && SecurityContextHolder.getContext().getAuthentication() == null) {
            extractJwtToken(request).ifPresent(token -> authenticateUser(token, request));
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Checks if the requested URI matches any public (non-authenticated) endpoint.
     */
    private boolean isPublicEndpoint(String requestURI) {
        return Arrays.stream(PUBLIC_ENDPOINT_PREFIXES)
                .anyMatch(requestURI::startsWith);
    }

    /**
     * Extracts the JWT token from the Authorization header if present and valid.
     */
    private Optional<String> extractJwtToken(HttpServletRequest request) {
        return Optional.ofNullable(request.getHeader(HttpHeaders.AUTHORIZATION))
                .filter(header -> header.startsWith(TOKEN_PREFIX))
                .map(header -> header.substring(TOKEN_PREFIX.length()));
    }

    /**
     * Validates the JWT token and sets authentication in the SecurityContext if valid.
     */
    private void authenticateUser(String jwtToken, HttpServletRequest request) {
        String userEmail = jwtService.extractUsername(jwtToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (jwtService.isTokenValid(jwtToken, userDetails) && userDetails.isEnabled()) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }
}