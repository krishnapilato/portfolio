package com.example.core.support;

import module java.base;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import com.example.core.security.RealmRoles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

@SpringBootTest(classes = TestApplication.class)
@AutoConfigureMockMvc
public abstract class IntegrationTest {

    @Autowired
    protected MockMvcTester mvc;

    protected static JwtRequestPostProcessor signedIn(String... roles) {
        return jwt()
            .jwt(token -> token.claim("realm_access", Map.of("roles", List.of(roles))))
            .authorities(new RealmRoles());
    }
}
