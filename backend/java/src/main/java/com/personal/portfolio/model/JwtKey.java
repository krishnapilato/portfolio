package com.personal.portfolio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(
        name = "jwt_keys",
        uniqueConstraints = {
                @UniqueConstraint(name = "uc_jwt_key_id", columnNames = "keyId")
        },
        indexes = {
                @Index(name = "idx_jwt_key_id", columnList = "keyId"),
                @Index(name = "idx_jwt_expiration", columnList = "expirationDate")
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class JwtKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Long id;

    @EqualsAndHashCode.Include
    @ToString.Include
    @Builder.Default
    @Column(nullable = false, length = 50, updatable = false)
    private String keyId = UUID.randomUUID().toString();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String secretKey;

    @ToString.Include
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdDate;

    @ToString.Include
    @Builder.Default
    @Column(nullable = false)
    private Instant expirationDate = Instant.now().plus(30, ChronoUnit.DAYS);

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
}