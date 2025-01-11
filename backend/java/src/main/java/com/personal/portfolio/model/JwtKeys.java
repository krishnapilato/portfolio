package com.personal.portfolio.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.Optional;

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
@EqualsAndHashCode(of = "keyId")
public class JwtKeys {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ensures the keyId is unique, indexed, and cannot be null.
    @Column(nullable = false, unique = true, length = 50)
    private String keyId;

    // Ensures the secretKey is stored securely and cannot be null.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String secretKey;

    // Tracks creation date and ensures it cannot be updated.
    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Instant createdDate;

    // Ensures expirationDate is not null and allows logical expiration checks.
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Instant expirationDate;

    /**
     * Checks if the key has expired.
     *
     * @return true if the expiration date is before the current time, false otherwise.
     * @throws IllegalStateException if the expiration date is not set.
     */
    public boolean isExpired() {
        return Optional.ofNullable(expirationDate).map(date -> date.isBefore(Instant.now())) // Compare expiration date with the current time.
                .orElseThrow(() -> new IllegalStateException("Expiration date is not set.")); // Handle missing expiration date.
    }
}