package com.portfolio.portfolio.service;

import com.portfolio.portfolio.model.JwtKeys;
import com.portfolio.portfolio.repository.JwtKeysRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

	private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

	private final JwtKeysRepository keyRepository;

	private static final String JWT_TOKEN_EXPIRED = "JWT Token expired: {}";
	private static final String INVALID_JWT_TOKEN = "Invalid JWT token: {}";

	@Value("${jwt.token.expiration:7200000}")
	private long tokenExpiration;

	public JwtService(JwtKeysRepository keyRepository) {
		this.keyRepository = keyRepository;
		rotateKey();
	}

	// Scheduled task to rotate keys daily
	@Scheduled(cron = "0 0 0 * * ?")
	public void rotateKey() {
		List<JwtKeys> expiredKeys = keyRepository.findExpiredKeys(Instant.now());

		if (!expiredKeys.isEmpty()) {
			keyRepository.deleteAllInBatch(expiredKeys);
			logger.info("Deleted {} expired keys.", expiredKeys.size());
		}

		Optional<JwtKeys> activeKeyOptional = keyRepository.findTopByOrderByCreatedDateDesc();
		if (activeKeyOptional.isEmpty() || activeKeyOptional.get().isExpired()) {
			SecretKey newKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
			String newKeyId = UUID.randomUUID().toString();
			JwtKeys newKeyEntity = new JwtKeys();
			newKeyEntity.setKeyId(newKeyId);
			newKeyEntity.setSecretKey(Base64.getEncoder().encodeToString(newKey.getEncoded()));
			newKeyEntity.setCreatedDate(Instant.now());
			newKeyEntity.setExpirationDate(Instant.now().plus(Duration.ofDays(28)));

			keyRepository.save(newKeyEntity);
			logger.info("JWT Secret key rotated. New key ID: {}", newKeyId);
		} else {
			logger.info("Skipping key rotation. Active key is not expired.");
		}
	}

	// Extracts username from JWT token
	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	// Extracts claims from JWT token
	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	// Checks if token is valid
	public boolean isTokenValid(String token, UserDetails userDetails) {
		if (token == null || token.isBlank()) {
			return false;
		}

		try {
			final String username = extractUsername(token);
			return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
		} catch (ExpiredJwtException e) {
			logger.warn(JWT_TOKEN_EXPIRED, e.getMessage());
			return false;
		} catch (JwtException e) {
			logger.error(INVALID_JWT_TOKEN, e.getMessage(), e);
			return false;
		}
	}

	// Checks if token is expired
	private boolean isTokenExpired(String token) {
		try {
			return extractExpiration(token).before(new Date());
		} catch (ExpiredJwtException e) {
			logger.warn(JWT_TOKEN_EXPIRED, e.getMessage());
			return true;
		}
	}

	// Generates JWT token with user details
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles",
				userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
		return generateToken(claims, userDetails);
	}

	// Generates JWT token with extra claims
	public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
		try {
			Instant now = Instant.now();
			return Jwts.builder()
					.setClaims(extraClaims)
					.setSubject(userDetails.getUsername())
					.setIssuer("Khova Krishna Pilato")
					.setAudience("com.personal.portfolio")
					.setIssuedAt(Date.from(now))
					.setExpiration(Date.from(now.plusMillis(tokenExpiration)))
					.signWith(getSignInKey(), SignatureAlgorithm.HS512)
					.compact();
		} catch (JwtException e) {
			logger.warn("Error generating JWT token", e);
			throw new RuntimeException("Error generating JWT token", e);
		}
	}

	// Extracts expiration date from JWT token
	public Date extractExpiration(String token) {
		return parseClaims(token).getExpiration();
	}

	// Extracts all claims from JWT token
	private Claims extractAllClaims(String token) {
		return parseClaims(token);
	}

	// Parses claims from JWT token
	private Claims parseClaims(String token) {
		try {
			return Jwts.parserBuilder().setSigningKey(getSignInKey()).build().parseClaimsJws(token).getBody();
		} catch (ExpiredJwtException e) {
			logger.warn(JWT_TOKEN_EXPIRED, e.getMessage());
			throw e;
		} catch (JwtException e) {
			logger.error(INVALID_JWT_TOKEN, e.getMessage());
			throw e;
		}
	}

	// Retrieves the signing key
	private SecretKey getSignInKey() {
		JwtKeys activeKey = keyRepository.findTopByOrderByCreatedDateDesc()
				.orElseThrow(() -> new IllegalStateException("No active key found!"));
		return Keys.hmacShaKeyFor(Base64.getDecoder().decode(activeKey.getSecretKey()));
	}
}