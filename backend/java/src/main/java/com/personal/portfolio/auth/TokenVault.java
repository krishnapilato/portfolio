package com.personal.portfolio.auth;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.KeyRing;
import com.personal.portfolio.platform.Problem.InvalidToken;
import com.personal.portfolio.platform.Problem.TokenReuse;
import com.personal.portfolio.user.User;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(noRollbackFor = ApiException.class)
public class TokenVault {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final int TOKEN_BYTES = 32;

    private final UserTokenRepository tokens;
    private final KeyRing keyRing;
    private final AppProperties properties;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public IssuedToken issue(User user, TokenPurpose purpose) {
        var family = purpose == TokenPurpose.REFRESH ? UUID.ofEpochMillis(clock.millis()).toString() : null;
        return store(user, purpose, family);
    }

    public IssuedToken rotate(UserToken refresh) {
        return store(refresh.getUser(), TokenPurpose.REFRESH, refresh.getFamily());
    }

    public UserToken redeem(String raw, TokenPurpose purpose) {
        var token = tokens.findByFingerprintAndPurpose(keyRing.fingerprint(raw), purpose)
                .orElseThrow(() -> invalid(purpose));
        if (token.isConsumed()) {
            throw alreadyRedeemed(token);
        }
        var now = clock.instant();
        if (token.isExpired(now)) {
            throw invalid(purpose);
        }
        if (tokens.claim(token.getId(), now) == 0) {
            throw alreadyRedeemed(token);
        }
        return token;
    }

    public int revoke(User user, TokenPurpose purpose) {
        var revoked = tokens.deleteByUserAndPurpose(user, purpose);
        log.debug("Revoked {} {} tokens of user {}", revoked, purpose, user.getId());
        return revoked;
    }

    public boolean issuedRecently(User user, TokenPurpose purpose) {
        var security = properties.security();
        var issuedAfter = clock.instant().plus(purpose.ttl(security)).minus(security.emailCooldown());
        return tokens.existsByUserAndPurposeAndConsumedAtIsNullAndExpiresAtAfter(user, purpose, issuedAfter);
    }

    public void revokeFamilyOf(String raw) {
        tokens.findByFingerprintAndPurpose(keyRing.fingerprint(raw), TokenPurpose.REFRESH)
                .map(UserToken::getFamily)
                .ifPresent(tokens::deleteByFamily);
    }

    @Scheduled(cron = "0 7 * * * *")
    public void purgeExpired() {
        var purged = tokens.deleteExpired(clock.instant());
        if (purged > 0) {
            log.info("Purged {} expired tokens", purged);
        }
    }

    private IssuedToken store(User user, TokenPurpose purpose, @Nullable String family) {
        var raw = randomToken();
        var expiresAt = clock.instant().plus(purpose.ttl(properties.security()));
        tokens.save(UserToken.issue(user, purpose, keyRing.fingerprint(raw), family, expiresAt));
        return new IssuedToken(raw, expiresAt);
    }

    private ApiException alreadyRedeemed(UserToken token) {
        return switch (token.getPurpose()) {
            case REFRESH -> reuseDetected(token);
            case EMAIL_VERIFICATION, PASSWORD_RESET -> invalid(token.getPurpose());
        };
    }

    private ApiException reuseDetected(UserToken replayed) {
        var userId = replayed.getUser().getId();
        var family = Objects.requireNonNull(replayed.getFamily());
        var revoked = tokens.deleteByFamily(family);
        log.warn("Refresh token reuse detected for user {}: revoked {} tokens of family {}", userId, revoked, family);
        events.publishEvent(AuditType.TOKEN_REUSE.event(clock.instant(), Long.toString(userId),
                Map.of("family", family, "revoked", revoked)));
        return new ApiException(new TokenReuse());
    }

    private static ApiException invalid(TokenPurpose purpose) {
        return new ApiException(new InvalidToken(purpose));
    }

    private static String randomToken() {
        var bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return ENCODER.encodeToString(bytes);
    }

    public record IssuedToken(String value, Instant expiresAt) {

        @Override
        public String toString() {
            return "IssuedToken[value=<redacted>, expiresAt=" + expiresAt + "]";
        }
    }
}
