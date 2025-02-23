package com.personal.portfolio.config;

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

/**
 * JWT Authentication Filter to validate and authenticate users based on JWT tokens.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Filters incoming requests and performs JWT authentication.
     *
     * @param request     Incoming HTTP request
     * @param response    Outgoing HTTP response
     * @param filterChain Filter chain to continue request processing
     * @throws ServletException If an error occurs during the filtering process
     * @throws IOException      If an I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Skip JWT authentication for public endpoints
        if (isPublicEndpoint(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract and validate JWT token from Authorization header
        String jwtToken = extractJwtToken(request);
        if (jwtToken == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            authenticateUser(jwtToken, request);
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Checks if the request is for a public endpoint that does not require authentication.
     *
     * @param requestURI The request URI
     * @return true if the request is for a public endpoint, false otherwise
     */
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/auth/") || requestURI.startsWith("/api/email/");
    }

    /**
     * Extracts the JWT token from the Authorization header.
     *
     * @param request The incoming HTTP request
     * @return The extracted JWT token, or null if not found
     */
    private String extractJwtToken(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        return (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;
    }

    /**
     * Authenticates the user based on the provided JWT token.
     *
     * @param jwtToken The JWT token extracted from the request
     * @param request  The incoming HTTP request
     */
    private void authenticateUser(String jwtToken, HttpServletRequest request) {
        String userEmail = jwtService.extractUsername(jwtToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (jwtService.isTokenValid(jwtToken, userDetails) && userDetails.isEnabled()) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }
}