package com.example.seed.plan;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import com.example.seed.SeedIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class RunTests extends SeedIntegrationTest {

    private static final MediaType YAML = MediaType.parseMediaType("application/yaml");

    @Test
    void runsAPlanForAnAdministrator() {
        assertThat(mvc.post().uri("/api/v1/runs?seed=1").with(as("admin")).contentType(YAML).content(plan("""
            - target: target
              method: POST
              path: /lists
              body: {name: "#{animal.name}"}
            """)))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("""
                {"completed": true, "steps": [{"step": "POST target/lists", "calls": 1}]}
                """);
        assertThat(target.received()).hasSize(1);
    }

    @Test
    void answersBadGatewayWhenAServiceRefusesACall() {
        assertThat(mvc.post().uri("/api/v1/runs").with(as("admin")).contentType(YAML).content(plan("""
            - target: target
              method: GET
              path: /refuse
            """)))
            .hasStatus(HttpStatus.BAD_GATEWAY)
            .bodyJson()
            .isLenientlyEqualTo("{\"completed\": false}");
    }

    @Test
    void namesEveryProblemOfAnInvalidPlan() {
        assertThat(mvc.post().uri("/api/v1/runs").with(as("admin")).contentType(YAML).content("""
            targets: {}
            steps:
              - target: ""
                method: FETCH
                path: no-slash
                repeat: 10001
            """))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"type": "urn:problem:invalid-plan", "title": "Invalid plan", "detail": "The plan has 5 problem(s)"}
                """)
            .extractingPath("$.errors")
            .asArray()
            .containsExactly(
                "steps[0].method must match \"GET|POST|PUT|PATCH|DELETE\"",
                "steps[0].path must match \"/.*\"",
                "steps[0].repeat must be less than or equal to 10000",
                "steps[0].target must not be blank",
                "targets must not be empty");
    }

    @Test
    void refusesWhatIsNotYaml() {
        assertThat(mvc.post().uri("/api/v1/runs").with(as("admin")).contentType(YAML).content("steps: [unclosed"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .extractingPath("$.errors")
            .asArray()
            .hasSize(1);
    }

    @Test
    void keepsRunsForAdministrators() {
        assertThat(mvc.post().uri("/api/v1/runs").with(as("user")).contentType(YAML).content("steps: []")).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.post().uri("/api/v1/runs").contentType(YAML).content("steps: []")).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void runsTheStartupPlanAndStopsTheServiceIfItFails() throws Exception {
        var plans = mock(Plans.class);
        var seeder = mock(Seeder.class);
        var plan = new Plan(Map.of("target", URI.create("http://localhost")), List.of());
        given(plans.read("plan")).willReturn(plan);
        var file = new ByteArrayResource("plan".getBytes(StandardCharsets.UTF_8), "startup plan");
        var step = new Seeder.Report.StepResult("POST target/lists", 1, null);

        given(seeder.run(any(), any())).willReturn(new Seeder.Report(true, List.of(step)));
        new StartupRun(plans, seeder, file).run(null);

        given(seeder.run(any(), any())).willReturn(new Seeder.Report(false, List.of(step)));
        assertThatThrownBy(() -> new StartupRun(plans, seeder, file).run(null))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("did not complete");
    }

    @Test
    void countsAMissingRepeatAsOne() {
        assertThat(new Plan.Step("target", "GET", "/", null, null, null).repeat()).isOne();
        assertThat(new Plan.Step("target", "GET", "/", 3, null, null).repeat()).isEqualTo(3);
    }
}
