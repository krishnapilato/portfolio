package com.personal.portfolio.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
		return this.expirationDate.isBefore(Instant.now());
	}
}