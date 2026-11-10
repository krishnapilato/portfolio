package com.example.mail;

import module java.base;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.willAnswer;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import com.example.core.security.RealmRoles;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.testcontainers.mysql.MySQLContainer;

/// Tests run against the same MySQL as production, started once by Testcontainers. Mail never leaves the test:
/// the sender is a mock, and [#sent()] replays what the service handed to it.
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"test", "demo"})
@Import(MailIntegrationTest.Containers.class)
public abstract class MailIntegrationTest {

    private static final Session SESSION = Session.getInstance(new Properties());

    @MockitoBean
    protected JavaMailSender sender;

    @Autowired
    protected MockMvcTester mvc;

    @Autowired
    protected JdbcClient jdbc;

    protected final List<MimeMessage> outgoing = new CopyOnWriteArrayList<>();

    // Each message is captured the moment it is handed over: right after, the service forgets its body.
    @BeforeEach
    void captureOutgoingMail() {
        willAnswer(call -> {
            var mime = new MimeMessage(SESSION);
            call.<MimeMessagePreparator>getArgument(0).prepare(mime);
            outgoing.add(mime);
            return null;
        }).given(sender).send(anyPreparator());
    }

    protected static JwtRequestPostProcessor admin() {
        return as("admin");
    }

    protected static JwtRequestPostProcessor as(String... roles) {
        return jwt().jwt(token -> token.claim("realm_access", Map.of("roles", List.of(roles)))).authorities(new RealmRoles());
    }

    protected void awaitFinished(UUID message) {
        await().atMost(Duration.ofSeconds(20)).until(() -> !"QUEUED".equals(status(message)));
    }

    protected String status(UUID message) {
        return jdbc.sql("SELECT status FROM message WHERE id = UUID_TO_BIN(?)").param(message.toString()).query(String.class).single();
    }

    protected List<MimeMessage> sent() {
        return List.copyOf(outgoing);
    }

    protected static MimeMessagePreparator anyPreparator() {
        return any(MimeMessagePreparator.class);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Containers {

        @Bean
        @ServiceConnection
        MySQLContainer mysql() {
            return new MySQLContainer("mysql:26.10.0");
        }
    }
}
