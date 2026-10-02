package com.personal.portfolio.auth;

import com.personal.portfolio.auth.AuthPayloads.Credentials;
import com.personal.portfolio.auth.AuthPayloads.EmailRequest;
import com.personal.portfolio.auth.AuthPayloads.PasswordChange;
import com.personal.portfolio.auth.AuthPayloads.PasswordReset;
import com.personal.portfolio.auth.AuthPayloads.ProfileUpdate;
import com.personal.portfolio.auth.AuthPayloads.RefreshRequest;
import com.personal.portfolio.auth.AuthPayloads.Registration;
import com.personal.portfolio.auth.AuthPayloads.TokenPair;
import com.personal.portfolio.auth.AuthPayloads.TokenRequest;
import com.personal.portfolio.auth.TokenVault.IssuedToken;
import com.personal.portfolio.mail.Notification.PasswordChanged;
import com.personal.portfolio.mail.Notification.ResetPassword;
import com.personal.portfolio.mail.Notification.VerifyEmail;
import com.personal.portfolio.mail.Notifier;
import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.platform.Problem.AccountUnavailable;
import com.personal.portfolio.platform.Problem.EmailTaken;
import com.personal.portfolio.platform.Problem.InvalidCredentials;
import com.personal.portfolio.platform.Problem.NotFound;
import com.personal.portfolio.platform.Problem.TemporarilyLocked;
import com.personal.portfolio.platform.Problem.WrongPassword;
import com.personal.portfolio.security.AccessTokens;
import com.personal.portfolio.user.AccountStatus;
import com.personal.portfolio.user.Role;
import com.personal.portfolio.user.User;
import com.personal.portfolio.user.UserPayloads.UserView;
import com.personal.portfolio.user.UserRepository;
import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
// A failed sign-in must still be saved, so API errors do not roll the transaction back.
@Transactional(noRollbackFor = ApiException.class)
class AuthService {

    // Compared against when the account is unknown, so every sign-in costs exactly one bcrypt check.
    private static final String DUMMY_HASH = "{bcrypt}$2a$10$bZnvbD8FRlEUTeMBXsnQv.9gz43xgORVvvl6MX27q/ox3BgPqMNQC";

    private final UserRepository users;
    private final TokenVault vault;
    private final AccessTokens accessTokens;
    private final PasswordEncoder passwordEncoder;
    private final Notifier notifier;
    private final ApplicationEventPublisher events;
    private final AppProperties properties;
    private final Clock clock;

    public UserView register(Registration registration) {
        var email = User.normalizeEmail(registration.email());
        if (users.existsByEmail(email)) {
            throw new ApiException(new EmailTaken(email));
        }
        var user = users.save(User.register(registration.fullName(), email, hash(registration.password()),
                Role.USER, AccountStatus.PENDING));
        sendVerification(user);
        audit(AuditType.USER_REGISTERED, user);
        log.info("Registered user {}", user.getId());
        return UserView.of(user);
    }

    public UserView verify(TokenRequest request) {
        var user = vault.redeem(request.token(), TokenPurpose.EMAIL_VERIFICATION).getUser();
        user.verifyEmail();
        audit(AuditType.EMAIL_VERIFIED, user);
        return flushed(user);
    }

    public void resendVerification(EmailRequest request) {
        findByEmail(request.email())
                .filter(user -> user.getStatus() == AccountStatus.PENDING)
                .filter(user -> !vault.issuedRecently(user, TokenPurpose.EMAIL_VERIFICATION))
                .ifPresent(user -> {
                    vault.revoke(user, TokenPurpose.EMAIL_VERIFICATION);
                    sendVerification(user);
                });
    }

    public TokenPair login(Credentials credentials) {
        var now = clock.instant();
        var email = User.normalizeEmail(credentials.email());
        var account = users.findForUpdateByEmail(email);
        // Unknown, locked and real accounts all get one bcrypt check and the same 401,
        // so neither the answer nor its timing reveals which emails are registered.
        var passwordMatches = passwordEncoder.matches(credentials.password(),
                account.map(User::getPasswordHash).orElse(DUMMY_HASH));
        var user = account.filter(found -> !found.isLockedOut(now))
                .orElseThrow(() -> rejected(email, account.isPresent() ? "locked" : "unknown-account"));
        if (!passwordMatches) {
            recordFailure(user, now);
            throw rejected(email, "bad-credentials");
        }
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new ApiException(new AccountUnavailable(user.getStatus()));
        }
        if (passwordEncoder.upgradeEncoding(user.getPasswordHash())) {
            user.upgradePasswordHash(hash(credentials.password()));
        }
        user.recordSuccessfulLogin(now);
        audit(AuditType.AUTHENTICATION_SUCCESS, user);
        return tokenPair(user, vault.issue(user, TokenPurpose.REFRESH));
    }

    public TokenPair refresh(RefreshRequest request) {
        var refresh = vault.redeem(request.refreshToken(), TokenPurpose.REFRESH);
        var user = refresh.getUser();
        var status = user.getStatus();
        if (status != AccountStatus.ACTIVE) {
            vault.revoke(user, TokenPurpose.REFRESH);
            throw new ApiException(new AccountUnavailable(status));
        }
        return tokenPair(user, vault.rotate(refresh));
    }

    public void logout(RefreshRequest request) {
        vault.revokeFamilyOf(request.refreshToken());
    }

    public void forgotPassword(EmailRequest request) {
        findByEmail(request.email())
                .filter(user -> canRecover(user.getStatus()))
                .filter(user -> !vault.issuedRecently(user, TokenPurpose.PASSWORD_RESET))
                .ifPresent(this::sendPasswordReset);
    }

    public void resetPassword(PasswordReset reset) {
        var user = vault.redeem(reset.token(), TokenPurpose.PASSWORD_RESET).getUser();
        if (!canRecover(user.getStatus())) {
            throw new ApiException(new AccountUnavailable(user.getStatus()));
        }
        user.changePassword(hash(reset.newPassword()));
        user.verifyEmail();
        vault.revoke(user, TokenPurpose.REFRESH);
        audit(AuditType.PASSWORD_RESET, user);
        notifyPasswordChanged(user);
    }

    @Transactional(readOnly = true)
    public UserView profile(long userId) {
        return UserView.of(find(userId));
    }

    public UserView updateProfile(long userId, ProfileUpdate update) {
        var user = find(userId);
        user.rename(update.fullName());
        return flushed(user);
    }

    public void changePassword(long userId, PasswordChange change) {
        var user = find(userId);
        var now = clock.instant();
        // The current password is all that stands between a stolen access token and a stolen account,
        // so guessing it is limited exactly like guessing at sign-in.
        if (user.isLockedOut(now)) {
            throw new ApiException(new TemporarilyLocked(lockedUntil(user)));
        }
        if (!passwordEncoder.matches(change.currentPassword(), user.getPasswordHash())) {
            recordFailure(user, now);
            throw new ApiException(new WrongPassword());
        }
        user.changePassword(hash(change.newPassword()));
        vault.revoke(user, TokenPurpose.REFRESH);
        vault.revoke(user, TokenPurpose.PASSWORD_RESET);
        audit(AuditType.PASSWORD_CHANGED, user);
        notifyPasswordChanged(user);
    }

    public void endSessions(long userId) {
        var user = find(userId);
        user.endSessions();
        vault.revoke(user, TokenPurpose.REFRESH);
    }

    private ApiException rejected(String email, String reason) {
        audit(AuditType.AUTHENTICATION_FAILURE, email, Map.of("reason", reason));
        return new ApiException(new InvalidCredentials());
    }

    private void recordFailure(User user, Instant now) {
        var security = properties.security();
        user.recordFailedLogin(now, security.maxFailedLogins(), security.lockout());
        if (user.isLockedOut(now)) {
            var until = lockedUntil(user);
            audit(AuditType.ACCOUNT_LOCKED, Long.toString(user.getId()), Map.of("until", until));
            log.warn("User {} locked out until {}", user.getId(), until);
        }
    }

    private TokenPair tokenPair(User user, IssuedToken refresh) {
        var access = accessTokens.issue(user);
        return new TokenPair(TokenType.BEARER.getValue(), access.value(), access.expiresAt(),
                properties.security().accessTokenTtl().toSeconds(), refresh.value(), refresh.expiresAt());
    }

    private void sendVerification(User user) {
        var token = vault.issue(user, TokenPurpose.EMAIL_VERIFICATION);
        notifier.notify(new VerifyEmail(user.getEmail(), user.getFullName(), token.value(),
                frontendLink("verify-email", token)));
    }

    private void sendPasswordReset(User user) {
        vault.revoke(user, TokenPurpose.PASSWORD_RESET);
        var token = vault.issue(user, TokenPurpose.PASSWORD_RESET);
        notifier.notify(new ResetPassword(user.getEmail(), user.getFullName(), token.value(),
                frontendLink("reset-password", token), TokenPurpose.PASSWORD_RESET.ttl(properties.security())));
    }

    private void notifyPasswordChanged(User user) {
        notifier.notify(new PasswordChanged(user.getEmail(), user.getFullName(), clock.instant()));
        log.info("Password of user {} changed; all sessions revoked", user.getId());
    }

    private URI frontendLink(String page, IssuedToken token) {
        return UriComponentsBuilder.fromUri(properties.frontendUrl())
                .pathSegment(page)
                .queryParam("token", token.value())
                .build()
                .toUri();
    }

    private Optional<User> findByEmail(String email) {
        return users.findByEmail(User.normalizeEmail(email));
    }

    private User find(long userId) {
        return users.findById(userId).orElseThrow(() -> new ApiException(new NotFound("user", userId)));
    }

    private UserView flushed(User user) {
        users.flush();
        return UserView.of(user);
    }

    private String hash(String rawPassword) {
        return Objects.requireNonNull(passwordEncoder.encode(rawPassword));
    }

    private static boolean canRecover(AccountStatus status) {
        return switch (status) {
            case PENDING, ACTIVE -> true;
            case LOCKED, DISABLED -> false;
        };
    }

    private static Instant lockedUntil(User user) {
        return Objects.requireNonNull(user.getLockedUntil());
    }

    private void audit(AuditType type, User user) {
        audit(type, Long.toString(user.getId()), Map.of());
    }

    private void audit(AuditType type, String principal, Map<String, ?> details) {
        events.publishEvent(type.event(clock.instant(), principal, details));
    }
}
