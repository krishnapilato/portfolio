package com.personal.portfolio.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

import com.personal.portfolio.auth.TokenVault.IssuedToken;
import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.InvalidToken;
import com.personal.portfolio.platform.Problem.TokenReuse;
import com.personal.portfolio.user.User;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@ExtendWith(OutputCaptureExtension.class)
class TokenVaultTests extends AuthTestSupport {

    private static final String RAW_TOKEN = "[A-Za-z0-9_-]{43}";
    private static final Pattern PURGE_LOG = Pattern.compile("Purged [1-9]\\d* expired tokens");

    @Autowired
    private TokenVault vault;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private AuditEventRepository audits;

    @ParameterizedTest
    @EnumSource(TokenPurpose.class)
    void issuesOpaqueTokensAndStoresOnlyTheirFingerprint(TokenPurpose purpose) {
        var owner = activeUser(uniqueEmail("issue"));
        var ttl = purpose.ttl(properties.security());
        var before = clock.instant();

        var issued = vault.issue(owner, purpose);

        assertThat(issued.value()).matches(RAW_TOKEN);
        assertThat(issued.expiresAt()).isBetween(before.plus(ttl), Instant.now().plus(ttl));
        assertThat(issued.toString()).doesNotContain(issued.value()).contains("<redacted>");
        var stored = stored(issued, purpose).orElseThrow();
        assertThat(stored.getFingerprint()).matches("[0-9a-f]{64}").isNotEqualTo(issued.value());
        assertThat(stored.getExpiresAt()).isCloseTo(issued.expiresAt(), within(1, ChronoUnit.MILLIS));
        assertThat(stored.isConsumed()).isFalse();
    }

    @Test
    void startsANewVersionSevenFamilyForEveryRefreshToken() {
        var owner = activeUser(uniqueEmail("family"));

        var first = vault.issue(owner, TokenPurpose.REFRESH);
        var second = vault.issue(owner, TokenPurpose.REFRESH);

        assertThat(family(first)).isNotEqualTo(family(second));
        assertThat(UUID.fromString(family(first)).version()).isEqualTo(7);
        assertThat(UUID.fromString(family(second)).version()).isEqualTo(7);
    }

    @ParameterizedTest
    @EnumSource(value = TokenPurpose.class, names = {"EMAIL_VERIFICATION", "PASSWORD_RESET"})
    void issuesOneTimeTokensWithoutAFamily(TokenPurpose purpose) {
        var issued = vault.issue(activeUser(uniqueEmail("single")), purpose);

        assertThat(stored(issued, purpose)).hasValueSatisfying(token -> assertThat(token.getFamily()).isNull());
    }

    @Test
    void rotationStaysInTheFamilyAndConsumesThePredecessor() {
        var owner = activeUser(uniqueEmail("rotate"));
        var issued = vault.issue(owner, TokenPurpose.REFRESH);

        var rotated = inTransaction(() -> vault.rotate(vault.redeem(issued.value(), TokenPurpose.REFRESH)));

        assertThat(family(rotated)).isEqualTo(family(issued));
        assertThat(rotated.value()).isNotEqualTo(issued.value());
        assertThat(stored(issued, TokenPurpose.REFRESH)).hasValueSatisfying(token -> assertThat(token.isConsumed()).isTrue());
        assertThat(stored(rotated, TokenPurpose.REFRESH)).hasValueSatisfying(token -> assertThat(token.isConsumed()).isFalse());
    }

    @ParameterizedTest
    @EnumSource(TokenPurpose.class)
    void rejectsExpiredTokensAsInvalid(TokenPurpose purpose) {
        var owner = activeUser(uniqueEmail("expired"));
        var raw = "expired-" + UUID.randomUUID();
        var family = purpose == TokenPurpose.REFRESH ? UUID.randomUUID().toString() : null;
        save(owner, purpose, raw, family, Instant.now().minusSeconds(1));

        var result = redeemOverHttp(purpose, raw);

        assertProblem(result, HttpStatus.BAD_REQUEST, "invalid-token");
        assertThat(result).bodyJson().extractingPath("$.detail").asString()
                .contains(purpose.name().toLowerCase(Locale.ROOT).replace('_', ' '));
        assertInvalid(raw, purpose);
        assertThat(tokens.findByFingerprintAndPurpose(keyRing.fingerprint(raw), purpose))
                .hasValueSatisfying(token -> assertThat(token.isConsumed()).isFalse());
    }

    @Test
    void rejectsUnknownTokensAndTokensPresentedForAnotherPurpose() {
        var owner = activeUser(uniqueEmail("purpose"));
        var refresh = vault.issue(owner, TokenPurpose.REFRESH);

        assertInvalid("never-issued-" + UUID.randomUUID(), TokenPurpose.EMAIL_VERIFICATION);
        assertInvalid(refresh.value(), TokenPurpose.EMAIL_VERIFICATION);
        assertInvalid(refresh.value(), TokenPurpose.PASSWORD_RESET);
        assertThat(stored(refresh, TokenPurpose.REFRESH))
                .hasValueSatisfying(token -> assertThat(token.isConsumed()).isFalse());
    }

    @ParameterizedTest
    @EnumSource(value = TokenPurpose.class, names = {"EMAIL_VERIFICATION", "PASSWORD_RESET"})
    void oneTimeTokensAreInvalidOnceRedeemed(TokenPurpose purpose) {
        var issued = vault.issue(activeUser(uniqueEmail("once")), purpose);

        vault.redeem(issued.value(), purpose);

        assertInvalid(issued.value(), purpose);
        assertThat(stored(issued, purpose)).hasValueSatisfying(token -> assertThat(token.isConsumed()).isTrue());
    }

    @Test
    void claimingATokenSucceedsExactlyOnce() {
        var issued = vault.issue(activeUser(uniqueEmail("claim")), TokenPurpose.REFRESH);
        var id = stored(issued, TokenPurpose.REFRESH).orElseThrow().getId();
        var claimedAt = clock.instant();

        assertThat(inTransaction(() -> tokens.claim(id, claimedAt))).isEqualTo(1);
        assertThat(inTransaction(() -> tokens.claim(id, claimedAt.plusSeconds(1)))).isZero();

        assertThat(stored(issued, TokenPurpose.REFRESH)).hasValueSatisfying(token ->
                assertThat(token.getConsumedAt()).isCloseTo(claimedAt, within(1, ChronoUnit.MILLIS)));
    }

    @Test
    void redeemingAnAlreadyClaimedRefreshTokenRevokesItsFamilyAsReuse() {
        var owner = activeUser(uniqueEmail("claimed"));
        var started = clock.instant();
        var issued = vault.issue(owner, TokenPurpose.REFRESH);
        var family = family(issued);
        var sibling = sibling(owner, issued);
        var id = stored(issued, TokenPurpose.REFRESH).orElseThrow().getId();
        assertThat(inTransaction(() -> tokens.claim(id, Instant.now()))).isEqualTo(1);

        assertThatThrownBy(() -> vault.redeem(issued.value(), TokenPurpose.REFRESH))
                .isInstanceOfSatisfying(ApiException.class,
                        exception -> assertThat(exception.problem()).isEqualTo(new TokenReuse()));

        assertThat(stored(issued, TokenPurpose.REFRESH)).isEmpty();
        assertThat(tokens.findByFingerprintAndPurpose(keyRing.fingerprint(sibling), TokenPurpose.REFRESH)).isEmpty();
        assertThat(audits.find(Long.toString(owner.getId()), started, "TOKEN_REUSE"))
                .singleElement()
                .satisfies(event -> assertThat(event.getData())
                        .containsEntry("family", family)
                        .containsEntry("revoked", 2));
    }

    @Test
    void losingTheClaimToAConcurrentRedemptionIsTreatedAsReuse() {
        var owner = activeUser(uniqueEmail("race"));
        var issued = vault.issue(owner, TokenPurpose.REFRESH);
        var sibling = sibling(owner, issued);

        inTransaction(() -> {
            var loaded = stored(issued, TokenPurpose.REFRESH).orElseThrow();
            assertThat(tokens.claim(loaded.getId(), Instant.now())).isEqualTo(1);
            assertThat(loaded.isConsumed()).isFalse();
            assertThatThrownBy(() -> vault.redeem(issued.value(), TokenPurpose.REFRESH))
                    .isInstanceOfSatisfying(ApiException.class,
                            exception -> assertThat(exception.problem()).isEqualTo(new TokenReuse()));
            return loaded.getId();
        });

        assertThat(stored(issued, TokenPurpose.REFRESH)).isEmpty();
        assertThat(tokens.findByFingerprintAndPurpose(keyRing.fingerprint(sibling), TokenPurpose.REFRESH)).isEmpty();
    }

    @Test
    void revokesOnlyTheRequestedPurposeOfTheRequestedUser() {
        var owner = activeUser(uniqueEmail("revoke"));
        var other = activeUser(uniqueEmail("revoke-other"));
        var verification = vault.issue(owner, TokenPurpose.EMAIL_VERIFICATION);
        var reset = vault.issue(owner, TokenPurpose.PASSWORD_RESET);
        var refresh = vault.issue(owner, TokenPurpose.REFRESH);
        var othersReset = vault.issue(other, TokenPurpose.PASSWORD_RESET);

        assertThat(vault.revoke(owner, TokenPurpose.PASSWORD_RESET)).isEqualTo(1);

        assertThat(stored(reset, TokenPurpose.PASSWORD_RESET)).isEmpty();
        assertThat(stored(verification, TokenPurpose.EMAIL_VERIFICATION)).isPresent();
        assertThat(stored(refresh, TokenPurpose.REFRESH)).isPresent();
        assertThat(stored(othersReset, TokenPurpose.PASSWORD_RESET)).isPresent();
    }

    @ParameterizedTest
    @EnumSource(value = TokenPurpose.class, names = {"EMAIL_VERIFICATION", "PASSWORD_RESET"})
    void remembersTokensIssuedWithinTheEmailCooldown(TokenPurpose purpose) {
        var owner = activeUser(uniqueEmail("cooldown"));
        var other = activeUser(uniqueEmail("cooldown-other"));
        assertThat(vault.issuedRecently(owner, purpose)).isFalse();

        vault.issue(owner, purpose);

        assertThat(vault.issuedRecently(owner, purpose)).isTrue();
        assertThat(vault.issuedRecently(other, purpose)).isFalse();
        assertThat(vault.issuedRecently(owner, TokenPurpose.REFRESH)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = TokenPurpose.class, names = {"EMAIL_VERIFICATION", "PASSWORD_RESET"})
    void forgetsTokensIssuedBeforeTheEmailCooldown(TokenPurpose purpose) {
        var owner = activeUser(uniqueEmail("cooled"));
        var security = properties.security();
        var ttl = purpose.ttl(security);
        var cooledDown = clock.instant().minus(security.emailCooldown());
        save(owner, purpose, "cooled-" + UUID.randomUUID(), null, cooledDown.plus(ttl));

        assertThat(vault.issuedRecently(owner, purpose)).isFalse();

        save(owner, purpose, "recent-" + UUID.randomUUID(), null, cooledDown.plusSeconds(30).plus(ttl));

        assertThat(vault.issuedRecently(owner, purpose)).isTrue();
    }

    @Test
    void ignoresRedeemedTokensWhenCheckingTheEmailCooldown() {
        var owner = activeUser(uniqueEmail("redeemed-cooldown"));
        var issued = vault.issue(owner, TokenPurpose.PASSWORD_RESET);

        vault.redeem(issued.value(), TokenPurpose.PASSWORD_RESET);

        assertThat(vault.issuedRecently(owner, TokenPurpose.PASSWORD_RESET)).isFalse();
    }

    @Test
    void revokingTheFamilyOfAnUnknownTokenChangesNothing() {
        var refresh = vault.issue(activeUser(uniqueEmail("unknown-family")), TokenPurpose.REFRESH);

        vault.revokeFamilyOf("never-issued-" + UUID.randomUUID());

        assertThat(stored(refresh, TokenPurpose.REFRESH)).isPresent();
    }

    @Test
    void purgesExpiredTokensAndKeepsValidOnes(CapturedOutput output) {
        var owner = activeUser(uniqueEmail("purge"));
        var expired = "purge-" + UUID.randomUUID();
        save(owner, TokenPurpose.EMAIL_VERIFICATION, expired, null, Instant.now().minus(1, ChronoUnit.MINUTES));
        var valid = vault.issue(owner, TokenPurpose.EMAIL_VERIFICATION);

        vault.purgeExpired();

        assertThat(tokens.findByFingerprintAndPurpose(keyRing.fingerprint(expired), TokenPurpose.EMAIL_VERIFICATION))
                .isEmpty();
        assertThat(stored(valid, TokenPurpose.EMAIL_VERIFICATION)).isPresent();
        var purgeLines = purgeLines(output);
        assertThat(purgeLines).isPositive();

        vault.purgeExpired();

        assertThat(stored(valid, TokenPurpose.EMAIL_VERIFICATION)).isPresent();
        assertThat(purgeLines(output)).isEqualTo(purgeLines);
        assertThat(output.getOut()).doesNotContain("Purged 0 expired tokens");
    }

    private static long purgeLines(CapturedOutput output) {
        return PURGE_LOG.matcher(output.getOut()).results().count();
    }

    private MvcTestResult redeemOverHttp(TokenPurpose purpose, String raw) {
        return switch (purpose) {
            case EMAIL_VERIFICATION -> post(VERIFY, Map.of("token", raw));
            case PASSWORD_RESET -> post(RESET, Map.of("token", raw, "newPassword", "Brand-New-Passw0rd"));
            case REFRESH -> post(REFRESH, refreshToken(raw));
        };
    }

    private void assertInvalid(String raw, TokenPurpose purpose) {
        assertThatThrownBy(() -> vault.redeem(raw, purpose))
                .isInstanceOfSatisfying(ApiException.class,
                        exception -> assertThat(exception.problem()).isEqualTo(new InvalidToken(purpose)));
    }

    private Optional<UserToken> stored(IssuedToken issued, TokenPurpose purpose) {
        return tokens.findByFingerprintAndPurpose(keyRing.fingerprint(issued.value()), purpose);
    }

    private String family(IssuedToken issued) {
        return Objects.requireNonNull(stored(issued, TokenPurpose.REFRESH).orElseThrow().getFamily());
    }

    private String sibling(User owner, IssuedToken issued) {
        var raw = "sibling-" + UUID.randomUUID();
        save(owner, TokenPurpose.REFRESH, raw, family(issued), issued.expiresAt());
        return raw;
    }

    private void save(User owner, TokenPurpose purpose, String raw, @Nullable String family, Instant expiresAt) {
        tokens.save(UserToken.issue(owner, purpose, keyRing.fingerprint(raw), family, expiresAt));
    }

    private <T> T inTransaction(Supplier<T> work) {
        return Objects.requireNonNull(new TransactionTemplate(transactionManager).execute(_ -> work.get()));
    }
}
