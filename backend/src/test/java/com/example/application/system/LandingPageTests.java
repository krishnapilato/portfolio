package com.example.application.system;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.application.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class LandingPageTests extends IntegrationTest {

    @Test
    void rendersOneGenericHeroWithoutRuntimeDetailsOrThirdPartyRequests() {
        assertThat(mvc.get().uri("/").accept(MediaType.TEXT_HTML))
            .hasStatusOk().hasViewName("index").bodyText()
            .contains("Foundation", "Good things", "Privacy first", "/assets/interface.css")
            .doesNotContain("<script", "<style", "cdn.jsdelivr.net", "preconnect", "Portfolio", "/actuator", "/api/v1/");
    }

    @Test
    void servesTheSharedStylesWithoutAuthentication() {
        assertThat(mvc.get().uri("/assets/interface.css")).hasStatusOk()
            .hasHeader("Content-Type", "text/css").bodyText().contains("prefers-reduced-motion", "100svh");
    }

    @Test
    void blocksInlineAndThirdPartyScriptsAndStyles() {
        var page = mvc.get().uri("/").exchange().getResponse();

        assertThat(page.getHeader("Content-Security-Policy"))
            .contains("script-src 'self'", "style-src 'self'", "object-src 'none'", "frame-ancestors 'none'")
            .doesNotContain("unsafe-inline", "unsafe-eval", "https:", "nonce-");
        assertThat(page.getHeader("Referrer-Policy")).isEqualTo("no-referrer");
    }

    @Test
    void keepsTheRetiredDashboardEndpointsClosed() {
        assertThat(mvc.get().uri("/system/snapshot")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/assets/home.js")).hasStatus(HttpStatus.UNAUTHORIZED);
    }
}
