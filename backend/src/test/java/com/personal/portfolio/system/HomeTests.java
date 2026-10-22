package com.personal.portfolio.system;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootVersion;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class HomeTests extends IntegrationTest {

    private static final Pattern CDN_TAG = Pattern.compile("<(?:script|link)[^>]*https://cdn\\.jsdelivr\\.net/npm/[^>]*>");
    private static final Pattern NONCE = Pattern.compile("<script nonce=\"([^\"]+)\">");

    @Test
    void rendersTheIndexWithoutAnyRuntimeDetails() {
        assertThat(mvc.get().uri("/").accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .hasViewName("home")
            .bodyText()
            .contains("The boring parts,", "What it covers")
            .doesNotContain("Running normally", "Spring Boot " + SpringBootVersion.getVersion(),
                "Java " + Runtime.version().feature(), "/actuator", "/api/v1/", "/v3/api-docs");
    }

    @Test
    void loadsEveryLibraryFromAPinnedVersionWithAnIntegrityCheck() throws Exception {
        var body = mvc.get().uri("/").exchange().getResponse().getContentAsString();

        var tags = CDN_TAG.matcher(body).results().map(MatchResult::group).toList();
        assertThat(tags).hasSize(5).allSatisfy(tag -> assertThat(tag)
            .containsPattern("@\\d+\\.\\d+\\.\\d+/")
            .contains("integrity=\"sha384-", "crossorigin=\"anonymous\""));
    }

    @Test
    void allowsOnlyTheInlineScriptCarryingThePagesNonce() throws Exception {
        var page = mvc.get().uri("/").exchange().getResponse();

        var nonces = NONCE.matcher(page.getContentAsString()).results().map(match -> match.group(1)).toList();
        assertThat(nonces).hasSize(1);
        assertThat(page.getHeader("Content-Security-Policy"))
            .contains("script-src 'self' 'nonce-" + nonces.getFirst() + "' https://cdn.jsdelivr.net")
            .contains("object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'")
            .doesNotContain("unsafe-eval");
        assertThat(page.getHeader("X-Frame-Options")).isEqualTo("DENY");
        assertThat(page.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(page.getHeader("Referrer-Policy")).isEqualTo("strict-origin-when-cross-origin");
    }

    @Test
    void keepsTheRetiredDashboardEndpointsClosed() {
        assertThat(mvc.get().uri("/system/snapshot")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/assets/home.js")).hasStatus(HttpStatus.UNAUTHORIZED);
    }
}
