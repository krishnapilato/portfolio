package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.personal.portfolio.support.AppPropertiesFixture;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class UserTokenTests {

    private static final Instant EXPIRY = Instant.parse("2026-10-01T12:00:00Z");
    private static final String FINGERPRINT = "f".repeat(64);
    private static final String FAMILY = "01999a4e-3c1b-7d2e-8f00-123456789abc";

    private final User owner = User.register("Ada Lovelace", "ada@example.test", "{noop}secret", Role.USER,
            AccountStatus.ACTIVE);

    @Test
    void keepsWhatItWasIssuedWith() {
        var token = UserToken.issue(owner, TokenPurpose.REFRESH, FINGERPRINT, FAMILY, EXPIRY);

        assertThat(token.getUser()).isSameAs(owner);
        assertThat(token.getPurpose()).isEqualTo(TokenPurpose.REFRESH);
        assertThat(token.getFingerprint()).isEqualTo(FINGERPRINT);
        assertThat(token.getFamily()).isEqualTo(FAMILY);
        assertThat(token.getExpiresAt()).isEqualTo(EXPIRY);
        assertThat(token.getConsumedAt()).isNull();
        assertThat(token.isConsumed()).isFalse();
    }

    @Test
    void expiresExactlyAtItsExpiryInstant() {
        var token = UserToken.issue(owner, TokenPurpose.EMAIL_VERIFICATION, FINGERPRINT, null, EXPIRY);

        assertThat(token.isExpired(EXPIRY.minusNanos(1))).isFalse();
        assertThat(token.isExpired(EXPIRY)).isTrue();
        assertThat(token.isExpired(EXPIRY.plusSeconds(1))).isTrue();
    }

    @Test
    void eachPurposeLivesForItsOwnConfiguredDuration() {
        var security = AppPropertiesFixture.defaults().security();

        assertThat(TokenPurpose.EMAIL_VERIFICATION.ttl(security)).isEqualTo(Duration.ofHours(24));
        assertThat(TokenPurpose.PASSWORD_RESET.ttl(security)).isEqualTo(Duration.ofHours(1));
        assertThat(TokenPurpose.REFRESH.ttl(security)).isEqualTo(Duration.ofDays(30));
    }
}
