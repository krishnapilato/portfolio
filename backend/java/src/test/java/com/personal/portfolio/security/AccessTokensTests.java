package com.personal.portfolio.security;

import static com.personal.portfolio.support.AppPropertiesFixture.ACCESS_TOKEN_TTL;
import static com.personal.portfolio.support.AppPropertiesFixture.AUDIENCE;
import static com.personal.portfolio.support.AppPropertiesFixture.ISSUER;
import static com.personal.portfolio.support.AppPropertiesFixture.secretOf;
import static com.personal.portfolio.support.AppPropertiesFixture.with;
import static com.personal.portfolio.support.AppPropertiesFixture.withSecret;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.personal.portfolio.platform.KeyRing;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.util.ReflectionTestUtils;

class AccessTokensTests {

    private static final Instant NOW = Instant.parse("2026-09-30T08:15:30.987654321Z");
    private static final Instant ISSUED_AT = Instant.parse("2026-09-30T08:15:30Z");
    private static final String SECRET = secretOf(filled(40, (byte) 0x5a));
    private static final KeyRing KEY_RING = new KeyRing(withSecret(SECRET));

    private final AccessTokens accessTokens = accessTokens(ACCESS_TOKEN_TTL);
    private final JwtDecoder decoder = decoder(KEY_RING.signingKey());

    @Test
    void signsTheRegisteredAndProfileClaimsWithHs256() {
        var token = accessTokens.issue(user(42, Role.USER));

        var jwt = decoder.decode(token.value());

        assertThat(jwt.getHeaders()).containsEntry("alg", "HS256");
        assertThat(jwt.getClaimAsString(JwtClaimNames.ISS)).isEqualTo(ISSUER);
        assertThat(jwt.getAudience()).containsExactly(AUDIENCE);
        assertThat(jwt.getSubject()).isEqualTo("42");
        assertThat(jwt.getClaimAsStringList("roles")).containsExactly("USER");
        assertThat(jwt.getClaimAsString("email")).isEqualTo("ada@example.test");
        assertThat(jwt.getClaimAsString("name")).isEqualTo("Ada Lovelace");
        assertThat(jwt.getClaims()).containsOnlyKeys("iss", "aud", "sub", "iat", "exp", "jti", "email", "name", "roles",
                "session_version");
        assertThat(AccessTokens.sessionVersion(jwt)).isZero();
    }

    @Test
    void issuesAtTheWholeSecondAndExpiresAfterTheTimeToLive() {
        var token = accessTokens.issue(user(42, Role.USER));

        var jwt = decoder.decode(token.value());

        assertThat(jwt.getIssuedAt()).isEqualTo(ISSUED_AT);
        assertThat(jwt.getExpiresAt()).isEqualTo(ISSUED_AT.plus(ACCESS_TOKEN_TTL));
        assertThat(token.expiresAt()).isEqualTo(jwt.getExpiresAt());
    }

    @ParameterizedTest
    @ValueSource(longs = {1, 5, 60, 1440})
    void expiryIsTheIssueTimePlusTheConfiguredTimeToLive(long minutes) {
        var ttl = Duration.ofMinutes(minutes);

        var jwt = decoder.decode(accessTokens(ttl).issue(user(7, Role.USER)).value());

        assertThat(jwt.getIssuedAt()).isNotNull();
        assertThat(jwt.getExpiresAt()).isEqualTo(jwt.getIssuedAt().plus(ttl));
    }

    @Test
    void identifiesEveryTokenWithATimeOrderedVersionSevenUuid() {
        var user = user(42, Role.USER);

        var first = UUID.fromString(decoder.decode(accessTokens.issue(user).value()).getId());
        var second = UUID.fromString(decoder.decode(accessTokens.issue(user).value()).getId());

        assertThat(first.version()).isEqualTo(7);
        assertThat(first.variant()).isEqualTo(2);
        assertThat(first.getMostSignificantBits() >>> 16).isEqualTo(NOW.toEpochMilli());
        assertThat(second).isNotEqualTo(first);
    }

    @ParameterizedTest
    @EnumSource(Role.class)
    void carriesTheRoleOfTheUser(Role role) {
        var jwt = decoder.decode(accessTokens.issue(user(3, role)).value());

        assertThat(jwt.getClaimAsStringList("roles")).containsExactly(role.name());
    }

    @Test
    void cannotBeVerifiedWithAKeyDerivedFromAnotherSecret() {
        var token = accessTokens.issue(user(42, Role.ADMIN)).value();
        var foreign = decoder(new KeyRing(withSecret(secretOf(filled(40, (byte) 0x33)))).signingKey());

        assertThatThrownBy(() -> foreign.decode(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void readsTheUserIdFromTheSubject() {
        var jwt = Jwt.withTokenValue("token").header("alg", "HS256").subject("9001").build();

        assertThat(AccessTokens.userId(jwt)).isEqualTo(9001L);
    }

    @Test
    void neverPrintsTheTokenValue() {
        var token = accessTokens.issue(user(42, Role.USER));

        assertThat(token.toString()).doesNotContain(token.value()).contains("<redacted>");
    }

    private static AccessTokens accessTokens(Duration ttl) {
        var encoder = NimbusJwtEncoder.withSecretKey(KEY_RING.signingKey()).algorithm(MacAlgorithm.HS256).build();
        return new AccessTokens(encoder, with(SECRET, ttl), Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static JwtDecoder decoder(SecretKey key) {
        var decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(_ -> OAuth2TokenValidatorResult.success());
        return decoder;
    }

    private static User user(long id, Role role) {
        var user = User.register("Ada Lovelace", "ada@example.test", "{noop}secret", role, AccountStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static byte[] filled(int length, byte value) {
        var bytes = new byte[length];
        Arrays.fill(bytes, value);
        return bytes;
    }
}
