package com.example.core;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.core.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import io.swagger.v3.oas.models.OpenAPI;

class PagesTests extends IntegrationTest {

    @Autowired
    private OpenAPI openApi;

    @Autowired
    private Clock clock;

    @Test
    void introducesTheServiceOnItsLandingPage() {
        assertThat(mvc.get().uri("/").accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .bodyText()
            .contains("<title>Example service</title>", "A service used to test the core.", "href=\"/demo/\"", "href=\"/swagger-ui.html\"")
            .doesNotContain("<script", "style=");
    }

    @Test
    void showsAnErrorPageWithoutDetails() {
        assertThat(mvc.get().uri("/error").accept(MediaType.TEXT_HTML).requestAttr("jakarta.servlet.error.status_code", 404))
            .hasStatus(HttpStatus.NOT_FOUND)
            .bodyText()
            .contains("<title>404 · Example service</title>", "Back to the start")
            .doesNotContain("Exception", "trace", "<script");
    }

    @Test
    void describesTheApiWithTheServiceNameAndBearerTokens() {
        assertThat(openApi.getInfo().getTitle()).isEqualTo("Example service");
        assertThat(openApi.getInfo().getDescription()).isEqualTo("A service used to test the core.");
        assertThat(openApi.getInfo().getLicense().getName()).isEqualTo("MIT");
        assertThat(openApi.getComponents().getSecuritySchemes()).containsKey("bearer-jwt");
        assertThat(openApi.getSecurity()).singleElement().satisfies(requirement -> assertThat(requirement).containsKey("bearer-jwt"));
    }

    @Test
    void tellsTimeInUtc() {
        assertThat(clock.getZone()).isEqualTo(ZoneOffset.UTC);
    }
}
