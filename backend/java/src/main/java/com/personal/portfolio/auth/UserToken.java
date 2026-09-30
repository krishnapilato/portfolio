package com.personal.portfolio.auth;

import com.personal.portfolio.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "user_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private TokenPurpose purpose;

    private String fingerprint;

    private @Nullable String family;

    private Instant expiresAt;

    private @Nullable Instant consumedAt;

    @CreationTimestamp
    private Instant createdAt;

    public static UserToken issue(User user, TokenPurpose purpose, String fingerprint, @Nullable String family,
            Instant expiresAt) {
        var token = new UserToken();
        token.user = user;
        token.purpose = purpose;
        token.fingerprint = fingerprint;
        token.family = family;
        token.expiresAt = expiresAt;
        return token;
    }

    public boolean isConsumed() {
        return consumedAt != null;
    }

    public boolean isExpired(Instant now) {
        return !now.isBefore(expiresAt);
    }
}
