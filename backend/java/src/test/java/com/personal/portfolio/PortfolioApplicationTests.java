package com.personal.portfolio;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class PortfolioApplicationTests extends IntegrationTest {

    @Test
    void contextLoads() {
        assertThat(mvc.get().uri("/"))
                .hasStatusOk()
                .hasContentTypeCompatibleWith(MediaType.TEXT_HTML);
        assertThat(mvc.get().uri("/actuator/health")).hasStatusOk();
        assertThat(mvc.get().uri("/api/v1/users")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/v3/api-docs"))
                .hasStatusOk()
                .bodyJson()
                .extractingPath("$.info.title")
                .isEqualTo("Portfolio Platform API");
    }

    @Test
    void guardsAdministrationByRole() {
        assertThat(mvc.get().uri("/api/v1/users").with(user(1))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.get().uri("/api/v1/users").with(admin())).hasStatusOk();
    }
}
