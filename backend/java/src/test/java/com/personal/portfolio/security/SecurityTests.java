package com.personal.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.CorrelationFilter;
import com.personal.portfolio.support.IntegrationTest;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

class SecurityTests extends IntegrationTest {

    private static final String ME = "/api/v1/me";
    private static final String USERS = "/api/v1/users";
    private static final String CONTENT_SECURITY_POLICY = String.join("; ",
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'");
    private static final long ROLE_CHECK_ONLY_ID = Long.MAX_VALUE - 1;
    private static final JwsHeader HS256 = JwsHeader.with(MacAlgorithm.HS256).build();

    @Autowired
    private AccessTokens accessTokens;

    @Autowired
    private JwtEncoder encoder;

    @Autowired
    private AppProperties properties;

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @ParameterizedTest
    @ValueSource(strings = {ME, USERS, "/api/v1/users/stats", "/api/v1/mail/messages", "/actuator/metrics"})
    void challengesAnonymousCallsWithABearerAuthenticationRequest(String path) {
        var result = mvc.get().uri(path).accept(MediaType.APPLICATION_JSON).exchange();

        assertThat(result).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(result.getResponse().getHeader(HttpHeaders.WWW_AUTHENTICATE)).startsWith("Bearer");
        assertThat(result.getResponse().isCommitted()).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {ME, "/nowhere"})
    void sendsAnonymousBrowsersToTheErrorPageWithABearerChallenge(String path) {
        var result = mvc.get().uri(path).accept(MediaType.TEXT_HTML).exchange();

        assertThat(result).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(result.getResponse().getHeader(HttpHeaders.WWW_AUTHENTICATE)).startsWith("Bearer");
        assertThat(result.getResponse().isCommitted()).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {USERS, "/api/v1/users/stats", "/api/v1/mail/messages", "/actuator/metrics", "/actuator/env",
            "/actuator/auditevents"})
    void forbidsRegularUsersFromAdministration(String path) {
        var result = mvc.get().uri(path).with(user(ROLE_CHECK_ONLY_ID)).exchange();

        assertThat(result).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(result.getResponse().getHeader(HttpHeaders.WWW_AUTHENTICATE)).contains("insufficient_scope");
    }

    @ParameterizedTest
    @ValueSource(strings = {USERS, "/actuator/metrics", "/actuator/env"})
    void letsAdministratorsIntoAdministration(String path) {
        assertThat(mvc.get().uri(path).with(admin())).hasStatusOk();
    }

    @ParameterizedTest
    @ValueSource(strings = {"/", "/actuator/health", "/actuator/info", "/v3/api-docs", "/favicon.svg"})
    void keepsPublicPagesOpenToAnonymousVisitors(String path) {
        assertThat(mvc.get().uri(path)).hasStatusOk();
    }

    @Test
    void showsTheActuatorIndexToAdministratorsOnly() {
        assertThat(mvc.get().uri("/actuator")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.get().uri("/actuator").with(admin())).hasStatusOk();
    }

    @Test
    void opensTheAuthenticationEndpointsOnlyForPost() {
        assertThat(mvc.get().uri("/api/v1/auth/login")).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(mvc.post().uri("/api/v1/auth/logout").contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"unknown\"}")).hasStatus(HttpStatus.NO_CONTENT);
    }

    @Test
    void grantsTheStoredRoleOfTheAccountBehindGenuineAccessTokens() {
        var member = account(Role.USER);
        var userToken = accessTokens.issue(member).value();
        var adminToken = accessTokens.issue(account(Role.ADMIN)).value();

        assertThat(withBearer(ME, userToken)).hasStatusOk().bodyJson().extractingPath("$.email")
                .isEqualTo(member.getEmail());
        assertThat(withBearer(USERS, userToken)).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(withBearer(USERS, adminToken)).hasStatusOk();
        assertThat(withBearer(ME, adminToken)).hasStatusOk().bodyJson().extractingPath("$.role")
                .isEqualTo(Role.ADMIN.name());
    }

    @Test
    void followsRoleChangesMadeAfterTheTokenWasIssued() {
        var member = account(Role.USER);
        var memberToken = accessTokens.issue(member).value();
        var admin = account(Role.ADMIN);
        var adminToken = accessTokens.issue(admin).value();

        member.assignRole(Role.ADMIN);
        users.save(member);
        admin.assignRole(Role.USER);
        users.save(admin);

        assertThat(withBearer(USERS, memberToken)).hasStatusOk();
        assertThat(withBearer(USERS, adminToken)).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.post().uri(USERS).header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"fullName": "Shadow Admin", "email": "shadow-%s@security.test",
                         "password": "Shadow-Passw0rd", "role": "ADMIN"}
                        """.formatted(UUID.randomUUID())))
                .hasStatus(HttpStatus.FORBIDDEN);
    }

    @ParameterizedTest
    @EnumSource(value = AccountStatus.class, names = {"LOCKED", "DISABLED"})
    void rejectsTokensOfAccountsThatAreNoLongerActive(AccountStatus status) {
        var admin = account(Role.ADMIN);
        var token = accessTokens.issue(admin).value();

        admin.transitionTo(status);
        users.save(admin);

        assertInvalidToken(withBearer(USERS, token));
        assertInvalidToken(withBearer(ME, token));
    }

    @Test
    void rejectsTokensOfDeletedAccounts() {
        var admin = account(Role.ADMIN);
        var token = accessTokens.issue(admin).value();

        users.deleteById(admin.getId());

        assertInvalidToken(withBearer(USERS, token));
    }

    @Test
    void ignoresStaleBearerTokensOnThePublicAuthenticationEndpoints() {
        var result = mvc.post().uri("/api/v1/auth/refresh")
                .header(HttpHeaders.AUTHORIZATION, "Bearer abc.def.ghi")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .exchange();

        assertThat(result).hasStatus(HttpStatus.BAD_REQUEST).doesNotContainHeader(HttpHeaders.WWW_AUTHENTICATE);
    }

    @ParameterizedTest
    @EnumSource(Forgery.class)
    void rejectsForgedOrStaleAccessTokens(Forgery forgery) {
        var result = withBearer(ME, forge(forgery));

        assertThat(result).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(result.getResponse().getHeader(HttpHeaders.WWW_AUTHENTICATE)).contains("invalid_token");
    }

    @Test
    void acceptsMinimalTokensSignedWithTheApplicationKey() {
        var member = account(Role.USER);
        var security = properties.security();

        var result = withBearer(ME, sign(encoder, claims(member.getId(), Instant.now(), security.issuer(),
                security.audience())));

        assertThat(result).hasStatusOk().bodyJson().extractingPath("$.id").convertTo(Long.class)
                .isEqualTo(member.getId());
    }

    @Test
    void rejectsSignedTokensThatBelongToNoSession() {
        var member = account(Role.USER);
        var security = properties.security();
        var now = Instant.now();
        var withoutSession = JwtClaimsSet.builder()
                .issuer(security.issuer())
                .audience(List.of(security.audience()))
                .subject(Long.toString(member.getId()))
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(15)))
                .build();

        assertThat(withBearer(ME, sign(encoder, withoutSession))).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void createsNoHttpSession() {
        var result = withBearer(ME, accessTokens.issue(account(Role.USER)).value());

        assertThat(result).hasStatusOk();
        assertThat(result.getRequest().getSession(false)).isNull();
        assertThat(result.getResponse().getHeader(HttpHeaders.SET_COOKIE)).isNull();
    }

    @Test
    void answersCorsPreflightsFromAllowedOrigins() {
        var origin = properties.cors().allowedOrigins().getFirst();

        var preflight = mvc.options().uri("/api/v1/auth/login")
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization, content-type, x-request-id")
                .exchange();

        assertThat(preflight).hasStatusOk()
                .hasHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin)
                .hasHeader(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600")
                .doesNotContainHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
        assertThat(preflight.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS))
                .contains("GET", "POST", "PUT", "PATCH", "DELETE");
        assertThat(preflight.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS))
                .containsIgnoringCase("authorization")
                .containsIgnoringCase("content-type")
                .containsIgnoringCase(CorrelationFilter.HEADER);
    }

    @Test
    void refusesCorsPreflightsFromOtherOrigins() {
        var preflight = mvc.options().uri("/api/v1/auth/login")
                .header(HttpHeaders.ORIGIN, "https://attacker.example")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .exchange();

        assertThat(preflight).hasStatus(HttpStatus.FORBIDDEN)
                .doesNotContainHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
    }

    @Test
    void exposesCorrelationLocationAndRetryHeadersToAllowedOrigins() {
        var origin = properties.cors().allowedOrigins().getFirst();

        var result = mvc.get().uri("/actuator/health").header(HttpHeaders.ORIGIN, origin).exchange();

        assertThat(result).hasStatusOk().hasHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
        assertThat(result.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS))
                .contains(CorrelationFilter.HEADER, HttpHeaders.LOCATION, HttpHeaders.RETRY_AFTER);
    }

    @Test
    void protectsPagesWithSecurityHeaders() {
        var page = mvc.get().uri("/").accept(MediaType.TEXT_HTML).exchange();

        assertThat(page).hasStatusOk()
                .hasHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY)
                .hasHeader("X-Frame-Options", "DENY")
                .hasHeader("Referrer-Policy", "strict-origin-when-cross-origin")
                .hasHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
                .hasHeader("X-Content-Type-Options", "nosniff")
                .doesNotContainHeader("Strict-Transport-Security");
    }

    @Test
    void enforcesHttpsForAYearIncludingSubdomainsOnSecureRequests() {
        var page = mvc.get().uri("/").secure(true).exchange();

        assertThat(page.getResponse().getHeader("Strict-Transport-Security"))
                .contains("max-age=" + Duration.ofDays(365).toSeconds())
                .contains("includeSubDomains");
    }

    @Test
    void hashesNewPasswordsWithBcryptAndFlagsWeakerHashesForUpgrade() {
        var hash = passwordEncoder.encode("Some-Passw0rd");
        var weaker = "{bcrypt}" + new BCryptPasswordEncoder(4).encode("Some-Passw0rd");

        assertThat(hash).startsWith("{bcrypt}$2");
        assertThat(passwordEncoder.matches("Some-Passw0rd", hash)).isTrue();
        assertThat(passwordEncoder.matches("other-Passw0rd", hash)).isFalse();
        assertThat(passwordEncoder.matches("Some-Passw0rd", weaker)).isTrue();
        assertThat(passwordEncoder.upgradeEncoding(weaker)).isTrue();
        assertThat(passwordEncoder.upgradeEncoding(hash)).isFalse();
    }

    private User account(Role role) {
        var email = role.name().toLowerCase(Locale.ROOT) + "-" + UUID.randomUUID() + "@security.test";
        return users.save(User.register("Security " + role.name(), email,
                Objects.requireNonNull(passwordEncoder.encode("Security-Passw0rd")), role, AccountStatus.ACTIVE));
    }

    private static void assertInvalidToken(MvcTestResult result) {
        assertThat(result).hasStatus(HttpStatus.UNAUTHORIZED);
        assertThat(result.getResponse().getHeader(HttpHeaders.WWW_AUTHENTICATE)).contains("invalid_token");
    }

    private MvcTestResult withBearer(String path, String token) {
        return mvc.get().uri(path).header(HttpHeaders.AUTHORIZATION, "Bearer " + token).exchange();
    }

    private String forge(Forgery forgery) {
        var security = properties.security();
        var now = Instant.now();
        var subject = account(Role.USER).getId();
        return switch (forgery) {
            case FOREIGN_KEY -> sign(foreignEncoder(), claims(subject, now, security.issuer(), security.audience()));
            case WRONG_ISSUER -> sign(encoder, claims(subject, now, "someone-else", security.audience()));
            case WRONG_AUDIENCE -> sign(encoder, claims(subject, now, security.issuer(), "another-api"));
            case EXPIRED -> sign(encoder, claims(subject, now.minus(Duration.ofHours(2)), security.issuer(),
                    security.audience()));
            case UNSIGNED -> "eyJhbGciOiJub25lIn0." + payloadOf(sign(encoder, claims(subject, now, security.issuer(),
                    security.audience()))) + ".";
            case GARBAGE -> "not-a-jwt";
        };
    }

    private static JwtClaimsSet claims(long subject, Instant issuedAt, String issuer, String audience) {
        return JwtClaimsSet.builder()
                .issuer(issuer)
                .audience(List.of(audience))
                .subject(Long.toString(subject))
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(Duration.ofMinutes(15)))
                .claim("roles", List.of(Role.USER.name()))
                .claim("session_version", 0)
                .build();
    }

    private static String payloadOf(String token) {
        return token.substring(token.indexOf('.') + 1, token.lastIndexOf('.'));
    }

    private static String sign(JwtEncoder jwtEncoder, JwtClaimsSet claims) {
        return jwtEncoder.encode(JwtEncoderParameters.from(HS256, claims)).getTokenValue();
    }

    private static JwtEncoder foreignEncoder() {
        var key = new byte[32];
        new SecureRandom().nextBytes(key);
        return NimbusJwtEncoder.withSecretKey(new SecretKeySpec(key, "HmacSHA256")).algorithm(MacAlgorithm.HS256).build();
    }

    enum Forgery {
        FOREIGN_KEY,
        WRONG_ISSUER,
        WRONG_AUDIENCE,
        EXPIRED,
        UNSIGNED,
        GARBAGE
    }
}
