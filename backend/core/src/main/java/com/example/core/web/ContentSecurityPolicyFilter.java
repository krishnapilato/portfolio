package com.example.core.web;

import module java.base;

import com.example.core.CoreProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/// Scripts run only from this service, from the origins listed in `core.csp.trusted-sources`, or when they
/// carry the nonce of the response they arrived in; a page reads it from the request attribute [#NONCE].
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
public class ContentSecurityPolicyFilter extends OncePerRequestFilter {

    public static final String NONCE = "cspNonce";
    static final String HEADER = "Content-Security-Policy";

    private static final int NONCE_BYTES = 16;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CoreProperties properties;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        var nonce = new byte[NONCE_BYTES];
        RANDOM.nextBytes(nonce);
        var encoded = Base64.getEncoder().encodeToString(nonce);
        request.setAttribute(NONCE, encoded);
        var path = request.getRequestURI().substring(request.getContextPath().length());
        response.setHeader(HEADER, policy(encoded, path.startsWith("/swagger-ui/")));
        chain.doFilter(request, response);
    }

    // Swagger UI positions its controls with inline styles. The service's own pages need none.
    private String policy(String nonce, boolean documentation) {
        var trusted = properties.csp().trustedSources();
        return String.join("; ",
            "default-src 'self'",
            directive("script-src", "'self' 'nonce-" + nonce + "'", trusted),
            directive("style-src", documentation ? "'self' 'unsafe-inline'" : "'self'", trusted),
            "img-src 'self' data:",
            directive("connect-src", "'self'", properties.csp().connectSources()),
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'");
    }

    private static String directive(String name, String own, List<String> sources) {
        return Stream.concat(Stream.of(name, own), sources.stream()).collect(Collectors.joining(" "));
    }
}
