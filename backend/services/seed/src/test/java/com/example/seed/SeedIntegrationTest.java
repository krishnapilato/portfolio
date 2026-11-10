package com.example.seed;

import module java.base;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import com.example.core.security.RealmRoles;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

/// The service seeds itself: [TargetController] stands in for a real service and keeps what it receives.
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles({"test", "demo"})
public abstract class SeedIntegrationTest {

    @Autowired
    protected MockMvcTester mvc;

    @Autowired
    protected TargetController target;

    @LocalServerPort
    protected int port;

    @BeforeEach
    void forgetEarlierCalls() {
        target.received().clear();
    }

    protected String plan(String steps) {
        return """
            targets:
              target: http://localhost:%d/target
            steps:
            %s""".formatted(port, steps.indent(2));
    }

    protected static JwtRequestPostProcessor as(String... roles) {
        return jwt().jwt(token -> token.claim("realm_access", Map.of("roles", List.of(roles)))).authorities(new RealmRoles());
    }
}
