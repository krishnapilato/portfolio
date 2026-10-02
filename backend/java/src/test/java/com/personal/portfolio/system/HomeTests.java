package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringBootVersion;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class HomeTests extends IntegrationTest {

    @Test
    void rendersTheIndexOnTheServerWithoutAnyScript() {
        assertThat(mvc.get().uri("/").accept(MediaType.TEXT_HTML))
                .hasStatusOk()
                .hasViewName("home")
                .bodyText()
                .contains("The boring parts,")
                .contains("Running normally")
                .contains("Java " + Runtime.version().feature() + " · Spring Boot " + SpringBootVersion.getVersion())
                .doesNotContain("<script");
    }

    @Test
    void protectsThePageWithAStrictContentSecurityPolicy() {
        assertThat(mvc.get().uri("/"))
                .hasStatusOk()
                .hasHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; "
                        + "style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; "
                        + "frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
                .hasHeader("X-Frame-Options", "DENY")
                .hasHeader("X-Content-Type-Options", "nosniff")
                .hasHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    }

    @Test
    void keepsTheRetiredDashboardEndpointsClosed() {
        assertThat(mvc.get().uri("/system/snapshot")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/assets/home.js")).hasStatus(HttpStatus.UNAUTHORIZED);
    }
}
