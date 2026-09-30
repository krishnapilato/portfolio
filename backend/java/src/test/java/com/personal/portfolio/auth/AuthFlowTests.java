package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;

class AuthFlowTests extends AuthTestSupport {

    private static final String NEW_PASSWORD = "Renewed-Passw0rd";
    private static final String WRONG_PASSWORD = "Wrong-Passw0rd";

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private AuditEventRepository audits;

    @Test
    void completesTheAccountJourneyFromRegistrationToLogout() {
        var email = uniqueEmail("ada");
        var registered = post(REGISTER, Map.of("fullName", "  Ada Lovelace ", "email", email.toUpperCase(Locale.ROOT),
                "password", PASSWORD));

        assertThat(registered).hasStatus(HttpStatus.CREATED).hasHeader(HttpHeaders.LOCATION, "http://localhost" + ME);
        var view = body(registered);
        assertThat(view.get("email").asString()).isEqualTo(email);
        assertThat(view.get("fullName").asString()).isEqualTo("Ada Lovelace");
        assertThat(view.get("role").asString()).isEqualTo("USER");
        assertThat(view.get("status").asString()).isEqualTo("PENDING");
        assertThat(view.propertyNames()).noneMatch(name -> name.toLowerCase(Locale.ROOT).contains("password"));

        var verification = lastMail(email, VERIFY_SUBJECT);
        var token = tokenIn(verification);
        assertThat(verification.getBody())
                .contains(properties.frontendUrl() + "/verify-email?token=" + token)
                .contains("Ada Lovelace");
        assertThat(mailsTo(email)).hasSize(1);

        assertThat(post(VERIFY, Map.of("token", token))).hasStatusOk()
                .bodyJson().extractingPath("$.status").isEqualTo("ACTIVE");
        assertThat(reload(email).getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertProblem(post(VERIFY, Map.of("token", token)), HttpStatus.BAD_REQUEST, "invalid-token");

        var before = Instant.now();
        var login = post(LOGIN, credentials(email.toUpperCase(Locale.ROOT), PASSWORD));
        assertThat(login).hasStatusOk();
        var pair = body(login);
        var ttl = properties.security().accessTokenTtl();
        assertThat(pair.get("tokenType").asString()).isEqualTo("Bearer");
        assertThat(pair.get("expiresIn").asLong()).isEqualTo(ttl.toSeconds());
        assertThat(Instant.parse(pair.get("accessTokenExpiresAt").asString()))
                .isCloseTo(before.plus(ttl), within(5, ChronoUnit.SECONDS));
        assertThat(Instant.parse(pair.get("refreshTokenExpiresAt").asString()))
                .isCloseTo(before.plus(properties.security().refreshTokenTtl()), within(5, ChronoUnit.SECONDS));

        var session = session(login);
        var jwt = jwtDecoder.decode(session.accessToken());
        var user = reload(email);
        assertThat(jwt.getSubject()).isEqualTo(Long.toString(user.getId()));
        assertThat(jwt.getClaimAsStringList("roles")).containsExactly("USER");
        assertThat(jwt.getExpiresAt()).isEqualTo(Instant.parse(pair.get("accessTokenExpiresAt").asString()));
        assertThat(user.getLastLoginAt()).isNotNull();

        assertThat(getWithBearer(ME, session.accessToken())).hasStatusOk()
                .bodyJson().extractingPath("$.email").isEqualTo(email);

        var rotated = session(post(REFRESH, refreshToken(session.refreshToken())));
        assertProblem(post(REFRESH, refreshToken(session.refreshToken())), HttpStatus.UNAUTHORIZED, "token-reuse");
        assertProblem(post(REFRESH, refreshToken(rotated.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");

        var fresh = login(email, PASSWORD);
        assertThat(post(LOGOUT, refreshToken(fresh.refreshToken()))).hasStatus(HttpStatus.NO_CONTENT);
        assertProblem(post(REFRESH, refreshToken(fresh.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
    }

    @Test
    void rejectsDuplicateRegistrationsCaseInsensitively() {
        var email = uniqueEmail("taken");
        activeUser(email);

        var result = post(REGISTER, Map.of("fullName", "Someone Else", "email", email.toUpperCase(Locale.ROOT),
                "password", PASSWORD));

        assertProblem(result, HttpStatus.CONFLICT, "email-taken");
        assertThat(result).bodyJson().extractingPath("$.detail").isEqualTo("An account for " + email + " already exists");
        assertThat(mailsTo(email)).isEmpty();
    }

    @Test
    void rotatesRefreshTokensAndRevokesTheWholeFamilyWhenAnOldOneIsReplayed() {
        var email = uniqueEmail("rotation");
        var owner = activeUser(email);
        var started = Instant.now();
        var original = login(email, PASSWORD);
        var parallel = login(email, PASSWORD);

        var rotated = post(REFRESH, refreshToken(original.refreshToken()));
        assertThat(rotated).hasStatusOk();
        var second = session(rotated);
        assertThat(second.refreshToken()).isNotEqualTo(original.refreshToken());
        assertThat(getWithBearer(ME, second.accessToken())).hasStatusOk();
        var newest = session(post(REFRESH, refreshToken(second.refreshToken())));

        var replay = post(REFRESH, refreshToken(original.refreshToken()));

        assertProblem(replay, HttpStatus.UNAUTHORIZED, "token-reuse");
        assertThat(replay).bodyJson().extractingPath("$.title").isEqualTo("Refresh token reuse detected");
        assertProblem(post(REFRESH, refreshToken(newest.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertProblem(post(REFRESH, refreshToken(second.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(post(REFRESH, refreshToken(parallel.refreshToken()))).hasStatusOk();
        assertThat(audits.find(Long.toString(owner.getId()), started, "TOKEN_REUSE"))
                .singleElement()
                .satisfies(event -> assertThat(event.getData()).containsEntry("revoked", 3)
                        .containsKey("family"));
    }

    @Test
    void logoutRevokesTheWholeSessionFamilyAndToleratesUnknownTokens() {
        var email = uniqueEmail("logout");
        activeUser(email);
        var original = login(email, PASSWORD);
        var rotated = session(post(REFRESH, refreshToken(original.refreshToken())));

        assertThat(post(LOGOUT, refreshToken(original.refreshToken()))).hasStatus(HttpStatus.NO_CONTENT);

        assertProblem(post(REFRESH, refreshToken(rotated.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(post(LOGOUT, refreshToken(rotated.refreshToken()))).hasStatus(HttpStatus.NO_CONTENT);
        assertThat(post(LOGOUT, refreshToken("never-issued"))).hasStatus(HttpStatus.NO_CONTENT);
    }

    @Test
    void resendingTheVerificationWithinTheCooldownKeepsTheFirstLink() {
        var email = uniqueEmail("resend-soon");
        var first = register(email);

        assertThat(post(RESEND, Map.of("email", email.toUpperCase(Locale.ROOT)))).hasStatus(HttpStatus.ACCEPTED);

        assertThat(mailsTo(email, VERIFY_SUBJECT)).hasSize(1);
        assertThat(post(VERIFY, Map.of("token", first))).hasStatusOk();
        assertThat(post(RESEND, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        assertThat(mailsTo(email, VERIFY_SUBJECT)).hasSize(1);
    }

    @Test
    void resendingTheVerificationAfterTheCooldownReplacesThePreviousToken() {
        var email = uniqueEmail("resend");
        var earlier = tokenIssuedBeforeTheCooldown(pendingUser(email), TokenPurpose.EMAIL_VERIFICATION);

        assertThat(post(RESEND, Map.of("email", email.toUpperCase(Locale.ROOT)))).hasStatus(HttpStatus.ACCEPTED);

        var fresh = tokenIn(lastMail(email, VERIFY_SUBJECT));
        assertProblem(post(VERIFY, Map.of("token", earlier)), HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(post(VERIFY, Map.of("token", fresh))).hasStatusOk();
    }

    @Test
    void resendingTheVerificationToAnUnknownAddressIsSilentlyAccepted() {
        var email = uniqueEmail("ghost");

        assertThat(post(RESEND, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        assertThat(mailsTo(email)).isEmpty();
    }

    @Test
    void forgotPasswordAlwaysAnswersAcceptedWithoutRevealingAccounts() {
        var unknown = uniqueEmail("nobody");
        var disabled = uniqueEmail("disabled");
        activeUser(disabled);
        changeStatus(disabled, AccountStatus.DISABLED);

        assertThat(post(FORGOT, Map.of("email", unknown))).hasStatus(HttpStatus.ACCEPTED);
        assertThat(post(FORGOT, Map.of("email", disabled))).hasStatus(HttpStatus.ACCEPTED);

        assertThat(mailsTo(unknown)).isEmpty();
        assertThat(mailsTo(disabled)).isEmpty();
    }

    @Test
    void resettingThePasswordRevokesEverySessionAndNotifiesTheOwner() {
        var email = uniqueEmail("reset");
        activeUser(email);
        var session = login(email, PASSWORD);

        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        var resetMail = lastMail(email, RESET_SUBJECT);
        var token = tokenIn(resetMail);
        assertThat(resetMail.getBody())
                .contains(properties.frontendUrl() + "/reset-password?token=" + token)
                .contains("1 hour");

        assertThat(post(RESET, Map.of("token", token, "newPassword", NEW_PASSWORD))).hasStatus(HttpStatus.NO_CONTENT);

        assertProblem(post(REFRESH, refreshToken(session.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
        assertProblem(post(LOGIN, credentials(email, PASSWORD)), HttpStatus.UNAUTHORIZED, "invalid-credentials");
        assertThat(post(LOGIN, credentials(email, NEW_PASSWORD))).hasStatusOk();
        assertThat(mailsTo(email, CHANGED_SUBJECT)).hasSize(1);
        assertProblem(post(RESET, Map.of("token", token, "newPassword", "Another-Passw0rd")),
                HttpStatus.BAD_REQUEST, "invalid-token");
    }

    @Test
    void requestingAnotherResetWithinTheCooldownKeepsTheFirstLink() {
        var email = uniqueEmail("reset-twice");
        activeUser(email);
        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        var first = tokenIn(lastMail(email, RESET_SUBJECT));

        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);

        assertThat(mailsTo(email, RESET_SUBJECT)).hasSize(1);
        assertThat(post(RESET, Map.of("token", first, "newPassword", NEW_PASSWORD))).hasStatus(HttpStatus.NO_CONTENT);
    }

    @Test
    void requestingAnotherResetAfterTheCooldownInvalidatesTheEarlierLink() {
        var email = uniqueEmail("reset-later");
        var earlier = tokenIssuedBeforeTheCooldown(activeUser(email), TokenPurpose.PASSWORD_RESET);

        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);

        var fresh = tokenIn(lastMail(email, RESET_SUBJECT));
        assertProblem(post(RESET, Map.of("token", earlier, "newPassword", NEW_PASSWORD)),
                HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(post(RESET, Map.of("token", fresh, "newPassword", NEW_PASSWORD))).hasStatus(HttpStatus.NO_CONTENT);
    }

    @Test
    void resettingThePasswordActivatesAPendingAccount() {
        var email = uniqueEmail("pending-reset");
        register(email);

        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        var token = tokenIn(lastMail(email, RESET_SUBJECT));
        assertThat(post(RESET, Map.of("token", token, "newPassword", NEW_PASSWORD))).hasStatus(HttpStatus.NO_CONTENT);

        assertThat(reload(email).getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(post(LOGIN, credentials(email, NEW_PASSWORD))).hasStatusOk();
    }

    @Test
    void refusesToResetThePasswordOfAnAccountDisabledAfterTheRequest() {
        var email = uniqueEmail("reset-disabled");
        activeUser(email);
        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        var token = tokenIn(lastMail(email, RESET_SUBJECT));
        changeStatus(email, AccountStatus.DISABLED);
        var hash = reload(email).getPasswordHash();

        assertProblem(post(RESET, Map.of("token", token, "newPassword", NEW_PASSWORD)),
                HttpStatus.FORBIDDEN, "account-unavailable");
        assertThat(reload(email).getPasswordHash()).isEqualTo(hash);
    }

    @Test
    void locksTheAccountAfterTheMaximumNumberOfFailedLogins() {
        var email = uniqueEmail("brute");
        var owner = activeUser(email);
        var security = properties.security();
        var started = Instant.now();

        for (var attempt = 0; attempt < security.maxFailedLogins(); attempt++) {
            assertProblem(post(LOGIN, credentials(email, WRONG_PASSWORD)), HttpStatus.UNAUTHORIZED,
                    "invalid-credentials");
        }
        var locked = post(LOGIN, credentials(email, PASSWORD));

        assertProblem(locked, HttpStatus.LOCKED, "temporarily-locked");
        var lockedUntil = Instant.parse(body(locked).get("lockedUntil").asString());
        assertThat(lockedUntil).isBetween(started.plus(security.lockout()), Instant.now().plus(security.lockout()));
        assertThat(Long.parseLong(Objects.requireNonNull(locked.getResponse().getHeader(HttpHeaders.RETRY_AFTER))))
                .isBetween(1L, security.lockout().toSeconds());
        assertThat(reload(email).getLockedUntil()).isCloseTo(lockedUntil, within(1, ChronoUnit.MILLIS));
        assertThat(reload(email).getFailedLogins()).isZero();
        assertThat(audits.find(email, started, "AUTHENTICATION_FAILURE")).hasSize(security.maxFailedLogins());
        assertThat(audits.find(Long.toString(owner.getId()), started, "ACCOUNT_LOCKED")).singleElement()
                .satisfies(event -> assertThat(event.getData()).containsKey("until"));
        assertProblem(post(LOGIN, credentials(email, WRONG_PASSWORD)), HttpStatus.LOCKED, "temporarily-locked");
        assertThat(reload(email).getLockedUntil()).isCloseTo(lockedUntil, within(1, ChronoUnit.MILLIS));
    }

    @Test
    void resettingThePasswordLiftsABruteForceLockout() {
        var email = uniqueEmail("locked-reset");
        activeUser(email);
        for (var attempt = 0; attempt < properties.security().maxFailedLogins(); attempt++) {
            assertProblem(post(LOGIN, credentials(email, WRONG_PASSWORD)), HttpStatus.UNAUTHORIZED,
                    "invalid-credentials");
        }
        assertProblem(post(LOGIN, credentials(email, PASSWORD)), HttpStatus.LOCKED, "temporarily-locked");

        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        var token = tokenIn(lastMail(email, RESET_SUBJECT));
        assertThat(post(RESET, Map.of("token", token, "newPassword", NEW_PASSWORD))).hasStatus(HttpStatus.NO_CONTENT);

        assertThat(post(LOGIN, credentials(email, NEW_PASSWORD))).hasStatusOk();
        assertThat(reload(email).getLockedUntil()).isNull();
    }

    @Test
    void rejectsPasswordsLongerThanBcryptCanHash() {
        var email = uniqueEmail("long-password");

        var result = post(REGISTER, Map.of("fullName", "Long Password", "email", email,
                "password", "Aa1" + "x".repeat(77)));

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("password");
        assertThat(users.existsByEmail(email)).isFalse();
    }

    @Test
    void aLapsedLockoutNoLongerBlocksSignIn() {
        var email = uniqueEmail("lapsed");
        activeUser(email);
        var lockout = properties.security().lockout();
        var user = reload(email);
        user.recordFailedLogin(Instant.now().minus(lockout).minusSeconds(1), 1, lockout);
        users.save(user);
        assertThat(reload(email).getLockedUntil()).isBefore(Instant.now());

        assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();

        assertThat(reload(email).getLockedUntil()).isNull();
    }

    @Test
    void recordsAnAuditTrailWithoutSecrets() {
        var email = uniqueEmail("audit");
        var started = Instant.now();
        var verification = register(email);
        assertThat(post(VERIFY, Map.of("token", verification))).hasStatusOk();
        assertProblem(post(LOGIN, credentials(email, WRONG_PASSWORD)), HttpStatus.UNAUTHORIZED, "invalid-credentials");
        login(email, PASSWORD);
        assertThat(post(FORGOT, Map.of("email", email))).hasStatus(HttpStatus.ACCEPTED);
        assertThat(post(RESET, Map.of("token", tokenIn(lastMail(email, RESET_SUBJECT)), "newPassword", NEW_PASSWORD)))
                .hasStatus(HttpStatus.NO_CONTENT);
        var principal = Long.toString(reload(email).getId());

        assertThat(audits.find(principal, started, null)).extracting(AuditEvent::getType)
                .containsExactly("USER_REGISTERED", "EMAIL_VERIFIED", "AUTHENTICATION_SUCCESS", "PASSWORD_RESET");
        assertThat(audits.find(email, started, "AUTHENTICATION_FAILURE")).singleElement()
                .satisfies(event -> assertThat(event.getData()).containsEntry("reason", "bad-credentials"));
        assertThat(audits.find(null, started, null))
                .filteredOn(event -> event.getPrincipal().equals(principal) || event.getPrincipal().equals(email))
                .allSatisfy(event -> {
                    assertThat(event.getData()).containsKey("requestId");
                    assertThat(event.getData().toString()).doesNotContain(PASSWORD).doesNotContain(NEW_PASSWORD)
                            .doesNotContain(verification);
                });
    }

    @Test
    void auditsSignInAttemptsForUnknownAccountsByTheirEmail() {
        var email = uniqueEmail("unknown-audit");
        var started = Instant.now();

        assertProblem(post(LOGIN, credentials(email, PASSWORD)), HttpStatus.UNAUTHORIZED, "invalid-credentials");

        assertThat(audits.find(email, started, "AUTHENTICATION_FAILURE")).singleElement()
                .satisfies(event -> assertThat(event.getData()).containsEntry("reason", "unknown-account"));
    }

    @Test
    void successfulLoginResetsTheFailureCounter() {
        var email = uniqueEmail("counter");
        activeUser(email);
        var belowLimit = properties.security().maxFailedLogins() - 1;

        for (var round = 0; round < 2; round++) {
            for (var attempt = 0; attempt < belowLimit; attempt++) {
                assertProblem(post(LOGIN, credentials(email, WRONG_PASSWORD)), HttpStatus.UNAUTHORIZED,
                        "invalid-credentials");
            }
            assertThat(reload(email).getFailedLogins()).isEqualTo(belowLimit);
            assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();
        }
        assertThat(reload(email).getLockedUntil()).isNull();
    }

    @Test
    void rejectsUnknownAccountsExactlyLikeWrongPasswords() {
        var email = uniqueEmail("known");
        activeUser(email);

        var unknown = post(LOGIN, credentials(uniqueEmail("unknown"), PASSWORD));
        var wrong = post(LOGIN, credentials(email, WRONG_PASSWORD));

        assertProblem(unknown, HttpStatus.UNAUTHORIZED, "invalid-credentials");
        assertProblem(wrong, HttpStatus.UNAUTHORIZED, "invalid-credentials");
        assertThat(body(unknown).get("detail")).isEqualTo(body(wrong).get("detail"));
        assertThat(body(unknown).get("title").asString()).isEqualTo("Invalid credentials");
    }

    @Test
    void refusesPendingAccountsOnlyOnceThePasswordIsRight() {
        var email = uniqueEmail("pending");
        register(email);

        var right = post(LOGIN, credentials(email, PASSWORD));

        assertProblem(right, HttpStatus.FORBIDDEN, "account-unavailable");
        assertThat(right).bodyJson().extractingPath("$.detail").isEqualTo("The account is pending");
        assertProblem(post(LOGIN, credentials(email, WRONG_PASSWORD)), HttpStatus.UNAUTHORIZED, "invalid-credentials");
    }

    @Test
    void refusesDisabledAccountsAndRevokesTheirSessionsOnRefresh() {
        var email = uniqueEmail("disabled-session");
        activeUser(email);
        var session = login(email, PASSWORD);
        changeStatus(email, AccountStatus.DISABLED);

        assertProblem(post(LOGIN, credentials(email, PASSWORD)), HttpStatus.FORBIDDEN, "account-unavailable");
        var refresh = post(REFRESH, refreshToken(session.refreshToken()));

        assertProblem(refresh, HttpStatus.FORBIDDEN, "account-unavailable");
        assertThat(refresh).bodyJson().extractingPath("$.detail").isEqualTo("The account is disabled");
        changeStatus(email, AccountStatus.ACTIVE);
        assertProblem(post(REFRESH, refreshToken(session.refreshToken())), HttpStatus.BAD_REQUEST, "invalid-token");
    }

    @Test
    void upgradesLegacyUnprefixedBcryptHashesOnLogin() {
        var email = uniqueEmail("legacy");
        var legacyHash = new BCryptPasswordEncoder().encode(PASSWORD);
        users.save(User.register("Legacy User", email, Objects.requireNonNull(legacyHash), Role.USER,
                AccountStatus.ACTIVE));

        assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();

        var upgraded = reload(email).getPasswordHash();
        assertThat(upgraded).startsWith("{bcrypt}$2").isNotEqualTo(legacyHash);
        assertThat(passwordEncoder.matches(PASSWORD, upgraded)).isTrue();
        assertThat(passwordEncoder.upgradeEncoding(upgraded)).isFalse();
        assertThat(post(LOGIN, credentials(email, PASSWORD))).hasStatusOk();
        assertThat(reload(email).getPasswordHash()).isEqualTo(upgraded);
    }

    @Test
    void reportsEveryInvalidRegistrationFieldInTheErrorsMap() {
        var result = post(REGISTER, Map.of("fullName", " ", "email", "not-an-email", "password", "weak"));

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        var problem = body(result);
        assertThat(problem.get("title").asString()).isEqualTo("Validation failed");
        assertThat(problem.get("detail").asString()).isEqualTo("The request contains 3 invalid field(s)");
        assertThat(problem.has("requestId")).isTrue();
        assertThat(problem.has("timestamp")).isTrue();
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnly(
                Map.entry("fullName", "must not be blank"),
                Map.entry("email", "must be a plain e-mail address"),
                Map.entry("password",
                        "must be 10-72 characters (at most 72 bytes) and contain upper-case, lower-case and a digit"));
        assertThat(result).bodyText().doesNotContain("weak\"");
    }

    @ParameterizedTest(name = "{0} rejects {2}")
    @MethodSource("invalidRequests")
    void rejectsInvalidPayloadsWithAFieldErrorMap(String uri, Map<String, String> payload, String field) {
        var result = post(uri, payload);

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsKey(field);
    }

    static Stream<Arguments> invalidRequests() {
        var tooLong = "x".repeat(101);
        return Stream.of(
                arguments(REGISTER, Map.of("fullName", tooLong, "email", uniqueEmail("long"), "password", PASSWORD),
                        "fullName"),
                arguments(REGISTER, Map.of("fullName", "No Digits", "email", uniqueEmail("weak"),
                        "password", "NoDigitsInHere"), "password"),
                arguments(LOGIN, Map.of("email", "", "password", PASSWORD), "email"),
                arguments(LOGIN, Map.of("email", uniqueEmail("blank"), "password", " "), "password"),
                arguments(VERIFY, Map.of("token", " "), "token"),
                arguments(LOGIN, Map.of("email", "\"a;b\"@auth.test", "password", PASSWORD), "email"),
                arguments(RESEND, Map.of("email", "nobody"), "email"),
                arguments(RESEND, Map.of("email", "\"a b\"@auth.test"), "email"),
                arguments(REFRESH, Map.of("refreshToken", ""), "refreshToken"),
                arguments(LOGOUT, Map.of(), "refreshToken"),
                arguments(FORGOT, Map.of("email", "a@"), "email"),
                arguments(FORGOT, Map.of("email", "\"a,b\"@auth.test"), "email"),
                arguments(RESET, Map.of("token", "", "newPassword", NEW_PASSWORD), "token"),
                arguments(RESET, Map.of("token", "abc", "newPassword", "alllowercase1"), "newPassword"));
    }

    @Test
    void refusesToRegisterAnAddressTheOutboxCannotStore() {
        var address = "\"ada," + UUID.randomUUID() + "\"@auth.test";

        var result = post(REGISTER, Map.of("fullName", "Quoted Local Part", "email", address, "password", PASSWORD));

        assertProblem(result, HttpStatus.BAD_REQUEST, "validation-failed");
        assertThat(result).bodyJson().extractingPath("$.errors").asMap().containsOnlyKeys("email");
        assertThat(users.existsByEmail(User.normalizeEmail(address))).isFalse();
    }
}
