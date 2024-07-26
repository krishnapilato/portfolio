package com.personal.portfolio.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.personal.portfolio.model.JwtKeys;
import com.personal.portfolio.repository.JwtKeysRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

	private JwtKeysRepository keyRepository;

	public JwtService(JwtKeysRepository keyRepository) {
		this.keyRepository = keyRepository;
		rotateKey();
	}

	@Scheduled(cron = "0 0 0 * * ?")
	public void rotateKey() {
		List<JwtKeys> expiredKeys = keyRepository.findAllByExpirationDateBefore(Instant.now());

		if (!expiredKeys.isEmpty()) {
			keyRepository.deleteAllInBatch(expiredKeys);
			logger.info("Deleted {} expired keys.", expiredKeys.size());
		}

		Optional<JwtKeys> activeKeyOptional = keyRepository.findFirstByOrderByCreatedDateDesc();
		if (!activeKeyOptional.isPresent() || activeKeyOptional.get().isExpired()) {
			SecretKey newKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
			String newKeyId = UUID.randomUUID().toString();
			JwtKeys newKeyEntity = new JwtKeys();
			newKeyEntity.setKeyId(newKeyId);
			newKeyEntity.setSecretKey(Base64.getEncoder().encodeToString(newKey.getEncoded()));
			newKeyEntity.setCreatedDate(Instant.now());
			newKeyEntity.setExpirationDate(Instant.now().plus(Duration.ofDays(30)));

			keyRepository.save(newKeyEntity);
			logger.info("JWT Secret key rotated. New key ID: {}", newKeyId);
		} else {
			logger.info("Skipping key rotation. Active key is not expired.");
		}
	}

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		if (token == null || token.isBlank()) {
			return false;
		}

		try {
			final String username = extractUsername(token);
			return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
		} catch (ExpiredJwtException e) {
			logger.warn("JWT Token expired: {}", e.getMessage());
			return false;
		} catch (JwtException e) {
			logger.error("Invalid JWT token: {}", e.getMessage(), e);
			return false;
		}
	}

	private boolean isTokenExpired(String token) {
		try {
			return extractExpiration(token).before(new Date());
		} catch (ExpiredJwtException e) {
			logger.warn("JWT Token expired: {}", e.getMessage());
			return true;
		}
	}

	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles",
				userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
		return generateToken(claims, userDetails);
	}

	public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
		try {
			return Jwts.builder().setClaims(extraClaims).setSubject(userDetails.getUsername())
					.setIssuer("krishnapilato").setAudience("audience").setIssuedAt(Date.from(Instant.now()))
					.setExpiration(Date.from(Instant.now().plusMillis(7200000)))
					.signWith(getSignInKey(), SignatureAlgorithm.HS512).compact();
		} catch (JwtException e) {
			logger.error("Error generating JWT token", e);
			throw new RuntimeException("Error generating JWT token", e);
		}
	}

	public Date extractExpiration(String token) {
		try {
			return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody()
					.getExpiration();
		} catch (ExpiredJwtException e) {
			logger.warn("JWT Token expired: {}", e.getMessage());
			throw e;
		} catch (JwtException e) {
			logger.error("Invalid JWT token: {}", e.getMessage());
			throw e;
		}
	}

	private Claims extractAllClaims(String token) {
		try {
			return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody();
		} catch (ExpiredJwtException e) {
			logger.warn("JWT Token expired: {}", e.getMessage());
			throw e;
		} catch (JwtException e) {
			logger.error("Invalid JWT token: {}", e.getMessage());
			throw e;
		}
	}

	private SecretKey getSignInKey() {
		JwtKeys activeKey = keyRepository.findFirstByOrderByCreatedDateDesc()
				.orElseThrow(() -> new IllegalStateException("No active key found!"));
		return Keys.hmacShaKeyFor(Base64.getDecoder().decode(activeKey.getSecretKey()));
	}
}