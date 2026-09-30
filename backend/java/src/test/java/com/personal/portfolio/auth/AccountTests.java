package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

class AccountTests extends AuthTestSupport {

    private static final String PASSWORD_PATH = ME + "/password";
    private static final String SESSIONS_PATH = ME + "/sessions";
    private static final String NEW_PASSWORD = "Changed-Passw0rd";

    @Autowired
    private AuditEventRepository audits;

    @Test
    void returnsTheProfileOfTheAuthenticatedUser() {
        var email = uniqueEmail("profile");
        var owner = activeUser(email);

        var profile = mvc.get().uri(ME).with(user(owner.getId())).exchange();

        assertThat(profile).hasStatusOk().hasContentTypeCompatibleWith(MediaType.APPLICATION_JSON);
        var view = body(profile);
        assertThat(view.get("id").asLong()).isEqualTo(owner.getId());
        assertThat(view.get("email").asString()).isEqualTo(email);
        assertThat(view.get("fullName").asString()).isEqualTo("Test User");
        assertThat(view.get("role").asString()).isEqualTo("USER");
        assertThat(view.get("status").asString()).isEqualTo("ACTIVE");
        assertThat(view.propertyNames()).containsExactlyInAnyOrder("id", "fullName", "email", "role", "status",
                "lastLoginAt", "createdAt", "updatedAt");
    }

    @Test
    void answersNotFoundWhenTheTokenSubjectHasNoAccount() {
        assertProblem(mvc.get().uri(ME).with(admin()).exchange(), HttpStatus.NOT_FOUND, "not-found");
    }

    @Test
    void renamesTheProfileOfTheAuthenticatedUser() {
        var email = uniqueEmail("rename");
        var owner = activeUser(email);
        var before = reload(email).getUpdatedAt();

        var renamed = patch(owner.getId(), Map.of("fullName", "  Grace Brewster Hopper "));

        assertThat(renamed).hasStatusOk().bodyJson().extractingPath("$.fullName").isEqualTo("Grace Brewster Hopper");
        var stored = reload(email);
        assertThat(stored.getFullName()).isEqualTo("Grace Brewster Hopper");
        assertThat(stored.getUpdatedAt()).isAfterOrEqualTo(before);
        assertThat(Instant.parse(body(renamed).get("updatedAt").asString()))
                .isCloseTo(stored.getUpdatedAt(), within(1, ChronoUnit.MILLIS));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "\t\n"})
    void rejectsBlankNames(String fullName) {
        var email = uniqueEmail("blank-name");
        var owner = activeUser(email);

        var result = patch(owner.getId(), Map.of("fullName", fullName));

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors.fullName").isEqualTo("must not be blank");
        assertThat(reload(email).getFullName()).isEqualTo("Test User");
    }

    @Test
    void rejectsNamesLongerThanOneHundredCharacters() {
        var owner = activeUser(uniqueEmail("long-name"));

        var result = patch(owner.getId(), Map.of("fullName", "n".repeat(101)));

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("fullName");
    }

    @Test
    void changesThePasswordEndsEverySessionAndNotifiesTheOwner() {
        var email = uniqueEmail("change");
        var owner = activeUser(email);
        var laptop = login(email, PASSWORD);
        var phone = login(email, PASSWORD);
        var started = Instant.now();

        var changed = changePassword(owner.getId(), PASSWORD, NEW_PASSWORD);

        assertThat(changed).hasStatus(HttpStatus.NO_CONTENT);
        assertProblem(post(REFRESH, refreshToken(laptop.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertProblem(post(REFRESH, refreshToken(phone.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertProblem(post(LOGIN, credentials(email, PASSWORD)), HttpStatus.UNAUTHORIZED, "invalid-credentials");
        assertThat(post(LOGIN, credentials(email, NEW_PASSWORD))).hasStatusOk();
        assertThat(lastMail(email, CHANGED_SUBJECT).getBody()).contains("Test User").contains(email);
        assertThat(audits.find(Long.toString(owner.getId()), started, "PASSWORD_CHANGED")).hasSize(1);
    }

    @Test
    void changingThePasswordInvalidatesPendingResetLinks() {
        var email = uniqueEmail("change-reset");
        var owner = activeUser(email);
        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        var pending = tokenIn(lastMail(email, RESET_SUBJECT));

        assertThat(changePassword(owner.getId(), PASSWORD, NEW_PASSWORD)).hasStatus(HttpStatus.NO_CONTENT);

        assertProblem(post(RESET, Map.of("token", pending, "newPassword", "Attacker-Passw0rd")),
                HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(post(LOGIN, credentials(email, NEW_PASSWORD))).hasStatusOk();
    }

    @Test
    void rejectsAPasswordChangeWithTheWrongCurrentPassword() {
        var email = uniqueEmail("wrong-current");
        var owner = activeUser(email);
        var session = login(email, PASSWORD);

        var result = changePassword(owner.getId(), "Not-The-Passw0rd", NEW_PASSWORD);

        assertProblem(result, HttpStatus.BAD_REQUEST, "wrong-password");
        assertThat(result).bodyJson().extractingPath("$.title").isEqualTo("Current password is incorrect");
        assertThat(post(REFRESH, refreshToken(session.refreshToken()))).hasStatusOk();
        assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();
        assertThat(mailsTo(email, CHANGED_SUBJECT)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"short1A", "no-upper-case-1", "NO-LOWER-CASE-1", "No-Digits-Here"})
    void rejectsWeakNewPasswords(String weak) {
        var email = uniqueEmail("weak-new");
        var owner = activeUser(email);

        var result = changePassword(owner.getId(), PASSWORD, weak);

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("newPassword");
        assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();
    }

    @Test
    void endsEverySessionOfTheCallerOnly() {
        var email = uniqueEmail("sessions");
        var owner = activeUser(email);
        var bystander = uniqueEmail("bystander");
        activeUser(bystander);
        var first = login(email, PASSWORD);
        var second = login(email, PASSWORD);
        var unrelated = login(bystander, PASSWORD);

        assertThat(mvc.delete().uri(SESSIONS_PATH).with(user(owner.getId()))).hasStatus(HttpStatus.NO_CONTENT);

        assertProblem(post(REFRESH, refreshToken(first.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertProblem(post(REFRESH, refreshToken(second.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(post(REFRESH, refreshToken(unrelated.refreshToken()))).hasStatusOk();
        assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();
    }

    @Test
    void acceptsRealAccessTokensIssuedAtLogin() {
        var email = uniqueEmail("bearer");
        activeUser(email);
        var session = login(email, PASSWORD);

        assertThat(getWithBearer(ME, session.accessToken())).hasStatusOk()
                .bodyJson().extractingPath("$.email").isEqualTo(email);
    }

    private MvcTestResult patch(long userId, Map<String, String> body) {
        return mvc.patch().uri(ME).with(user(userId)).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(body)).exchange();
    }

    private MvcTestResult changePassword(long userId, String current, String next) {
        return mvc.put().uri(PASSWORD_PATH).with(user(userId)).contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("currentPassword", current, "newPassword", next))).exchange();
    }
}
