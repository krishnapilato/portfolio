package com.portfolio.portfolio.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Optional;

/**
 * Entity representing JWT keys.
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

	@Column(nullable = false, unique = true)
	private String keyId;

	@Column(nullable = false)
	private String secretKey;

	@Column(nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Instant createdDate;

	@Column(nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Instant expirationDate;

	public boolean isExpired() {
		return Optional.ofNullable(expirationDate)
				.map(date -> date.isBefore(Instant.now()))
				.orElseThrow(() -> new IllegalStateException("Expiration date is not set."));
	}
}