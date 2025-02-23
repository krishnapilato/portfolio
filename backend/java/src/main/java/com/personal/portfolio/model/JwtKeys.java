package com.personal.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Entity representing JWT keys.
 * This entity is used to store information about the JWT signing keys,
 * including their unique ID, secret key, creation, and expiration dates.
 */
@Table(name = "jwt_keys")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "keyId")
public class JwtKeys {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique Key Identifier (UUID ensures uniqueness)
    @Column(nullable = false, unique = true, length = 50)
    private String keyId = UUID.randomUUID().toString();

    // Stores the secret key securely
    @Column(nullable = false, columnDefinition = "TEXT")
    private String secretKey;

    // Tracks creation timestamp
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdDate;

    // Expiration timestamp (default: 30 days)
    @Column(nullable = false)
    private Instant expirationDate = Instant.now().plus(30, ChronoUnit.DAYS);

    /**
     * Checks if the key has expired.
     *
     * @return true if expired, false otherwise.
     */
    public boolean isExpired() {
        return expirationDate.isBefore(Instant.now());
    }

    /**
     * Checks if the key is still valid (not expired and has a secret key).
     *
     * @return true if the key is valid, false otherwise.
     */
    public boolean isValid() {
        return secretKey != null && !isExpired();
    }

    /**
     * Renews the key by setting a new expiration date.
     *
     * @param days Number of days to extend.
     */
    public void renewKey(int days) {
        this.expirationDate = Instant.now().plus(days, ChronoUnit.DAYS);
    }

    /**
     * Gets the remaining validity time in days.
     *
     * @return Remaining days before expiration.
     */
    public long getRemainingValidity() {
        return Instant.now().until(expirationDate, ChronoUnit.DAYS);
    }

    /**
     * Overrides `toString` to exclude `secretKey` for security reasons.
     *
     * @return String representation of JwtKeys.
     */
    @Override
    public String toString() {
        return "JwtKeys{" +
                "id=" + id +
                ", keyId='" + keyId + '\'' +
                ", createdDate=" + createdDate +
                ", expirationDate=" + expirationDate +
                ", isExpired=" + isExpired() +
                '}';
    }
}