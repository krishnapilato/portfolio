package com.example.core.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.core.support.IntegrationTest;
import org.junit.jupiter.api.Test;

class ContentSecurityPolicyFilterTests extends IntegrationTest {

    private static final String HEADER = ContentSecurityPolicyFilter.HEADER;

    @Test
    void allowsScriptsFromTheServiceTrustedSourcesAndTheResponseNonce() {
        var result = mvc.get().uri("/").exchange();
        var nonce = (String) result.getRequest().getAttribute(ContentSecurityPolicyFilter.NONCE);

        assertThat(nonce).hasSize(24);
        assertThat(result.getResponse().getHeader(HEADER)).isEqualTo(String.join("; ",
            "default-src 'self'",
            "script-src 'self' 'nonce-" + nonce + "' https://cdn.jsdelivr.net",
            "style-src 'self' https://cdn.jsdelivr.net",
            "img-src 'self' data:",
            "connect-src 'self' http://localhost:8081",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"));
    }

    @Test
    void usesANewNonceForEveryResponse() {
        var first = mvc.get().uri("/").exchange().getRequest().getAttribute(ContentSecurityPolicyFilter.NONCE);
        var second = mvc.get().uri("/").exchange().getRequest().getAttribute(ContentSecurityPolicyFilter.NONCE);

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void letsOnlyTheApiReferenceUseInlineStyles() {
        assertThat(mvc.get().uri("/swagger-ui/index.html").exchange().getResponse().getHeader(HEADER))
            .contains("style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net");
    }
}
