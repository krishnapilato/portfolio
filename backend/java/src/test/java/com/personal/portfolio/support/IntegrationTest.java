package com.personal.portfolio.support;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import com.personal.portfolio.user.Role;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTest {

    protected static final long ADMIN_ID = Long.MAX_VALUE;

    private static final Session MAIL_SESSION = Session.getInstance(new Properties());

    @MockitoBean
    protected JavaMailSender mailSender;

    @Autowired
    protected MockMvcTester mvc;

    @BeforeEach
    protected void stubMimeMessages() {
        given(mailSender.createMimeMessage()).willAnswer(_ -> new MimeMessage(MAIL_SESSION));
    }

    protected static RequestPostProcessor admin() {
        return admin(ADMIN_ID);
    }

    protected static RequestPostProcessor admin(long id) {
        return bearer(id, Role.ADMIN);
    }

    protected static RequestPostProcessor user(long id) {
        return bearer(id, Role.USER);
    }

    private static RequestPostProcessor bearer(long id, Role role) {
        return jwt()
                .jwt(token -> token.subject(Long.toString(id)).claim("roles", List.of(role.name())))
                .authorities(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}
