package com.personal.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "jwt_keys", uniqueConstraints = {
        @UniqueConstraint(name = "uc_jwt_key_id", columnNames = "keyId")
}, indexes = {
        @Index(name = "idx_jwt_key_id", columnList = "keyId"),
        @Index(name = "idx_jwt_expiration", columnList = "expirationDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class JwtKeys {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true, length = 50, updatable = false)
    private String keyId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String secretKey;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdDate;

    @Column(nullable = false)
    private Instant expirationDate;

    /**
     * Initializes defaults if not set.
     */
    @PrePersist
    private void prePersist() {
        if (keyId == null) {
            this.keyId = UUID.randomUUID().toString();
        }
        if (expirationDate == null) {
            this.expirationDate = Instant.now().plus(30, ChronoUnit.DAYS);
        }
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expirationDate);
    }

    public boolean isValid() {
        return secretKey != null && !isExpired();
    }

    public void renewKey(int days) {
        this.expirationDate = Instant.now().plus(days, ChronoUnit.DAYS);
    }

    public long getRemainingValidity() {
        return Instant.now().until(expirationDate, ChronoUnit.DAYS);
    }

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