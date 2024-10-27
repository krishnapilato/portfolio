package com.portfolio.portfolio.config;

import com.portfolio.portfolio.service.JwtService;
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

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserDetailsService userDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// Skip JWT authentication for specific auth endpoints
		String requestURI = request.getRequestURI();
		if (requestURI.startsWith("/auth/login") || requestURI.startsWith("/auth/signup")) {
			filterChain.doFilter(request, response);
			return;
		}

		// Get the Authorization header and validate the format
		String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		// Extract the token from the header
		String jwtToken = authHeader.substring(7);

		// Check if the user is already authenticated
		Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
		if (existingAuth != null && existingAuth.isAuthenticated()) {
			filterChain.doFilter(request, response);
			return;
		}

		try {
			// Extract the username from the token
			String userEmail = jwtService.extractUsername(jwtToken);
			UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

			// Validate the token and check if the user is enabled
			if (jwtService.isTokenValid(jwtToken, userDetails) && userDetails.isEnabled()) {
				// Create an authentication token and set it in the SecurityContext
				UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
						userDetails, null, userDetails.getAuthorities());
				authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authToken);
			}
		} catch (Exception e) {
			// Clear the SecurityContext in case of any token error
			SecurityContextHolder.clearContext();
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
					e.getMessage().contains("expired") ? "Token expired" : "Invalid token");
			return;
		}

		// Continue the filter chain
		filterChain.doFilter(request, response);
	}
}