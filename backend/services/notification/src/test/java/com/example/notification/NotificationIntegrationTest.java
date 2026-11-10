package com.example.notification;

import module java.base;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import com.example.core.security.RealmRoles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.testcontainers.containers.GenericContainer;

/// Tests run against the same Redis as production, started once by Testcontainers.
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles({"test", "demo"})
@Import(NotificationIntegrationTest.Containers.class)
public abstract class NotificationIntegrationTest {

    @Autowired
    protected MockMvcTester mvc;

    protected static String someone() {
        return "person-" + UUID.randomUUID();
    }

    protected static JwtRequestPostProcessor signedInAs(String subject, String... roles) {
        return jwt().jwt(token -> token.subject(subject).claim("realm_access", Map.of("roles", List.of(roles)))).authorities(new RealmRoles());
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Containers {

        @Bean
        @ServiceConnection(name = "redis")
        GenericContainer<?> redis() {
            return new GenericContainer<>("redis:8.10.3-alpine").withExposedPorts(6379);
        }
    }
}
