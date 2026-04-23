package com.personal.portfolio;

import com.personal.portfolio.model.PasswordResetToken;
import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import com.personal.portfolio.repository.PasswordResetTokenRepository;
import com.personal.portfolio.repository.UserRepository;
import com.personal.portfolio.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class PortfolioApplicationTests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
        given(emailService.generatePasswordResetToken()).willReturn("known-reset-token");
    }

    @Test
    void contextLoads() {
        assertThat(mockMvc).isNotNull();
    }

    @Test
    void adminEndpointsRejectNonAdmins() throws Exception {
        mockMvc.perform(get("/api/users")
                        .with(user("user@example.com").roles("USER")))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/email/send")
                        .param("recipient", "target@example.com")
                        .param("subject", "Subject")
                        .param("body", "Body"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/email/send")
                        .with(user("user@example.com").roles("USER"))
                        .param("recipient", "target@example.com")
                        .param("subject", "Subject")
                        .param("body", "Body"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userResponsesNeverExposePasswords() throws Exception {
        var savedUser = userRepository.save(User.builder()
                .fullName("Regular User")
                .email("user@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .enabled(true)
                .build());

        mockMvc.perform(get("/api/users/{id}", savedUser.getId())
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void userListingSupportsPaginationAndFilters() throws Exception {
        userRepository.save(User.builder()
                .fullName("Active User")
                .email("active.user@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .enabled(true)
                .locked(false)
                .build());

        userRepository.save(User.builder()
                .fullName("Locked User")
                .email("locked.user@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .enabled(true)
                .locked(true)
                .build());

        userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin.user@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.ADMIN)
                .enabled(true)
                .locked(false)
                .build());

        mockMvc.perform(get("/api/users")
                        .with(user("admin@example.com").roles("ADMIN"))
                        .param("role", "USER")
                        .param("locked", "false")
                        .param("search", "active")
                        .param("page", "0")
                        .param("size", "5")
                        .param("sortBy", "email")
                        .param("direction", "ASC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("active.user@example.com"))
                .andExpect(jsonPath("$.content[0].password").doesNotExist())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void userListingRejectsUnsupportedSortField() throws Exception {
        mockMvc.perform(get("/api/users")
                        .with(user("admin@example.com").roles("ADMIN"))
                        .param("sortBy", "password"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid Request"));
    }

    @Test
    void deletingUserAlsoRemovesPasswordResetTokens() throws Exception {
        var savedUser = userRepository.save(User.builder()
                .fullName("Delete User")
                .email("delete@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .enabled(true)
                .build());

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(savedUser)
                .tokenHash("a".repeat(64))
                .expiresAt(Instant.now().plusSeconds(3600))
                .build());

        mockMvc.perform(delete("/api/users/{id}", savedUser.getId())
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(savedUser.getId())).isEmpty();
        assertThat(passwordResetTokenRepository.findAll()).isEmpty();
    }

    @Test
    void forgotPasswordStoresHashedTokenAndResetConsumesIt() throws Exception {
        var savedUser = userRepository.save(User.builder()
                .fullName("Reset User")
                .email("reset@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .enabled(true)
                .build());

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "reset@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the address exists, a password reset email has been sent."));

        var tokens = passwordResetTokenRepository.findAll();
        assertThat(tokens).hasSize(1);
        assertThat(tokens.get(0).getTokenHash()).isNotEqualTo("known-reset-token");
        verify(emailService).sendPasswordResetEmail("reset@example.com", "known-reset-token");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "known-reset-token",
                                  "newPassword": "NewPassword123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully."));

        var reloadedUser = userRepository.findById(savedUser.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("NewPassword123", reloadedUser.getPassword())).isTrue();
        assertThat(passwordResetTokenRepository.findAll()).isEmpty();
    }

    @Test
    void loginReturnsRealExpiryAndUpdatesLastLogin() throws Exception {
        userRepository.save(User.builder()
                .fullName("Login User")
                .email("login@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .enabled(true)
                .build());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "login@example.com",
                                  "password": "Password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.expiresIn", greaterThan(0)));

        var reloadedUser = userRepository.findByEmail("login@example.com").orElseThrow();
        assertThat(reloadedUser.getLastLogin()).isNotNull();
    }

    @Test
    void resetPasswordRejectsUnknownToken() throws Exception {
        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "missing-token",
                                  "newPassword": "NewPassword123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid Password Reset Token"));
    }
}
