package com.personal.portfolio.config;

import com.personal.portfolio.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter for handling JWT authentication on every request.
 * Extends {@link OncePerRequestFilter} to ensure the filter is executed once per request.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Filters incoming HTTP requests to authenticate users via JWT.
     *
     * @param request     the incoming HTTP request
     * @param response    the outgoing HTTP response
     * @param filterChain the filter chain to continue processing the request
     * @throws ServletException if an error occurs during the filtering process
     * @throws IOException      if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // Skip JWT authentication for login, signup, and email endpoints
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/auth/") || requestURI.startsWith("/api/email/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the JWT token from the Authorization header
        String jwtToken = authHeader.substring(7);

        // Skip if the user is already authenticated
        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
        if (existingAuth != null && existingAuth.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extract the username from the JWT token
            String userEmail = jwtService.extractUsername(jwtToken);

            // Load user details from the database
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // Validate the JWT token and the user's status
            if (jwtService.isTokenValid(jwtToken, userDetails) && userDetails.isEnabled()) {
                // Set authentication in the SecurityContext
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Log and clear context if authentication fails
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        // Proceed with the filter chain
        filterChain.doFilter(request, response);
    }
}