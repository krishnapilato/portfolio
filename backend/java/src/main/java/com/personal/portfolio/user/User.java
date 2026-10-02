package com.personal.portfolio.user;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.IllegalTransition;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.NaturalId;
import org.hibernate.annotations.UpdateTimestamp;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Version
    private long version;

    private String fullName;

    @NaturalId
    private String email;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    private int failedLogins;

    private @Nullable Instant lockedUntil;

    private @Nullable Instant lastLoginAt;

    // Every access token carries this number. Bumping it (new password, "sign out everywhere") makes all
    // tokens issued before unusable at once, without keeping a list of revoked tokens.
    private int sessionVersion;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static User register(String fullName, String email, String passwordHash, Role role, AccountStatus status) {
        var user = new User();
        user.fullName = fullName.strip();
        user.email = normalizeEmail(email);
        user.passwordHash = passwordHash;
        user.role = role;
        user.status = status;
        return user;
    }

    public static String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    public void transitionTo(AccountStatus target) {
        if (status == target) return;
        if (!status.canTransitionTo(target))
            throw new ApiException(new IllegalTransition(status, target));

        status = target;
        if (target == AccountStatus.ACTIVE) {
            failedLogins = 0;
            lockedUntil = null;
        }
    }

    public void verifyEmail() {
        if (status == AccountStatus.PENDING) transitionTo(AccountStatus.ACTIVE);
    }

    public boolean isLockedOut(Instant now) {
        return lockedUntil != null && now.isBefore(lockedUntil);
    }

    public boolean acceptsTokenOfSession(int tokenSessionVersion) {
        return status == AccountStatus.ACTIVE && tokenSessionVersion == sessionVersion;
    }

    public void recordFailedLogin(Instant now, int maxAttempts, Duration lockout) {
        failedLogins++;
        if (failedLogins >= maxAttempts) {
            lockedUntil = now.plus(lockout);
            failedLogins = 0;
        }
    }

    public void recordSuccessfulLogin(Instant now) {
        failedLogins = 0;
        lockedUntil = null;
        lastLoginAt = now;
    }

    public void changePassword(String passwordHash) {
        this.passwordHash = passwordHash;
        failedLogins = 0;
        lockedUntil = null;
        endSessions();
    }

    public void upgradePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void endSessions() {
        sessionVersion++;
    }

    public void rename(String fullName) {
        this.fullName = fullName.strip();
    }

    public void assignRole(Role role) {
        this.role = role;
    }
}
