package com.example.seed.plan;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.seed.SeedIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class SeedDemoTests extends SeedIntegrationTest {

    @Test
    void showsTheExamplePlanPointedAtTheMailService() {
        assertThat(mvc.get().uri("/demo/").accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .bodyText()
            .contains("Seed any service from a file", "mail: https://mail.test", "#{internet.safeEmailAddress}", "src=\"/demo/demo.js\"");
    }

    @Test
    void runsTheEditedPlan() {
        assertThat(mvc.post().uri("/demo/api/run").contentType(MediaType.TEXT_PLAIN).content(plan("""
            - target: target
              method: POST
              path: /lists
              body: {name: demo}
            """)))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("{\"completed\": true}");
        assertThat(target.received()).singleElement().satisfies(body -> assertThat(body).containsEntry("name", "demo"));
    }
}
