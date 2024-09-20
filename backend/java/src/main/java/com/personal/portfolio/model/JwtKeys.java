package com.personal.portfolio.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Table(name = "jwt_keys")
@Entity
@Getter
@Setter
public class JwtKeys {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String keyId;

	@Column(nullable = false)
	private String secretKey;

	@Column(nullable = false)
	private Instant createdDate;

	@Column(nullable = false)
	private Instant expirationDate;

	public boolean isExpired() {
		return this.expirationDate.isBefore(Instant.now());
	}
}