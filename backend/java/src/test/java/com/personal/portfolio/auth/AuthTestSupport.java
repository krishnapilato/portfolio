package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.mail.MailMessage;
import com.personal.portfolio.mail.MailRepository;
import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.KeyRing;
import com.personal.portfolio.support.IntegrationTest;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

abstract class AuthTestSupport extends IntegrationTest {

    static final String REGISTER = "/api/v1/auth/register";
    static final String VERIFY = "/api/v1/auth/verify";
    static final String RESEND = "/api/v1/auth/verify/resend";
    static final String LOGIN = "/api/v1/auth/login";
    static final String REFRESH = "/api/v1/auth/refresh";
    static final String LOGOUT = "/api/v1/auth/logout";
    static final String FORGOT = "/api/v1/auth/password/forgot";
    static final String RESET = "/api/v1/auth/password/reset";
    static final String ME = "/api/v1/me";

    static final String PASSWORD = "Initial-Passw0rd";
    static final String VERIFY_SUBJECT = "Confirm your email address";
    static final String RESET_SUBJECT = "Reset your password";
    static final String CHANGED_SUBJECT = "Your password was changed";

    private static final Pattern MAIL_TOKEN = Pattern.compile("/(verify-email|reset-password)\\?token=([A-Za-z0-9_-]{43})");

    @Autowired
    JsonMapper json;

    @Autowired
    UserRepository users;

    @Autowired
    MailRepository mails;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AppProperties properties;

    @Autowired
    UserTokenRepository tokens;

    @Autowired
    KeyRing keyRing;

    static String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID() + "@auth.test";
    }

    static Map<String, String> credentials(String email, String password) {
        return Map.of("email", email, "password", password);
    }

    static Map<String, String> refreshToken(String token) {
        return Map.of("refreshToken", token);
    }

    static void assertProblem(MvcTestResult result, HttpStatus status, String slug) {
        assertThat(result)
                .hasStatus(status)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .extractingPath("$.type")
                .isEqualTo("urn:problem:" + slug);
    }

    MvcTestResult post(String uri, Map<String, ?> body) {
        return mvc.post().uri(uri).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))
                .exchange();
    }

    MvcTestResult getWithBearer(String uri, String accessToken) {
        return mvc.get().uri(uri).header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken).exchange();
    }

    JsonNode body(MvcTestResult result) {
        return json.readTree(result.getResponse().getContentAsByteArray());
    }

    User activeUser(String email) {
        return users.save(User.register("Test User", email, Objects.requireNonNull(passwordEncoder.encode(PASSWORD)),
                Role.USER, AccountStatus.ACTIVE));
    }

    User pendingUser(String email) {
        var passwordHash = Objects.requireNonNull(passwordEncoder.encode(PASSWORD));
        return users.save(User.register("Pending Person", email, passwordHash, Role.USER, AccountStatus.PENDING));
    }

    String tokenIssuedBeforeTheCooldown(User owner, TokenPurpose purpose) {
        var security = properties.security();
        var raw = "aged-" + UUID.randomUUID();
        var expiresAt = Instant.now().minus(security.emailCooldown()).minusSeconds(1).plus(purpose.ttl(security));
        tokens.save(UserToken.issue(owner, purpose, keyRing.fingerprint(raw), null, expiresAt));
        return raw;
    }

    User reload(String email) {
        return users.findByEmail(email).orElseThrow();
    }

    void changeStatus(String email, AccountStatus status) {
        var user = reload(email);
        user.transitionTo(status);
        users.save(user);
    }

    Session login(String email, String password) {
        var result = post(LOGIN, credentials(email, password));
        assertThat(result).hasStatusOk();
        return session(result);
    }

    Session session(MvcTestResult result) {
        var pair = body(result);
        return new Session(pair.get("accessToken").asString(), pair.get("refreshToken").asString());
    }

    String register(String email) {
        var result = post(REGISTER, Map.of("fullName", "Pending Person", "email", email, "password", PASSWORD));
        assertThat(result).hasStatus(HttpStatus.CREATED);
        return tokenIn(lastMail(email, VERIFY_SUBJECT));
    }

    List<MailMessage> mailsTo(String email) {
        return mails.findAll().stream()
                .filter(mail -> mail.getRecipients().contains(email))
                .sorted(Comparator.comparingLong(MailMessage::getId))
                .toList();
    }

    List<MailMessage> mailsTo(String email, String subject) {
        return mailsTo(email).stream().filter(mail -> mail.getSubject().equals(subject)).toList();
    }

    MailMessage lastMail(String email, String subject) {
        var matching = mailsTo(email, subject);
        assertThat(matching).as("mail '%s' to %s", subject, email).isNotEmpty();
        return matching.getLast();
    }

    static String tokenIn(MailMessage mail) {
        var matcher = MAIL_TOKEN.matcher(mail.getBody());
        assertThat(matcher.find()).as("token link in mail %d", mail.getId()).isTrue();
        return matcher.group(2);
    }

    record Session(String accessToken, String refreshToken) {}
}
