package com.personal.portfolio.service;

import com.personal.portfolio.model.JwtKeys;
import com.personal.portfolio.repository.JwtKeysRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.apache.commons.lang3.StringUtils;
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

/**
 * Service for managing JSON Web Tokens (JWT).
 * Includes functionality for generating, validating, and rotating JWT secret keys.
 */
@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.token.expiration:7200000}")
    private long tokenExpiration;

    private final JwtKeysRepository keyRepository;
    private volatile SecretKey cachedSigningKey;

    public JwtService(JwtKeysRepository keyRepository) {
        this.keyRepository = keyRepository;
        rotateKey(); // Initialize key on startup
    }

    /**
     * Scheduled task to rotate the secret key daily at midnight.
     * Deletes expired keys and generates a new one if necessary.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public synchronized void rotateKey() {
        Instant now = Instant.now();

        // Delete expired keys
        List<JwtKeys> expiredKeys = keyRepository.findExpiredKeys(now);
        if (!expiredKeys.isEmpty()) {
            keyRepository.deleteAllInBatch(expiredKeys);
            logger.info("Deleted {} expired JWT keys.", expiredKeys.size());
        }

        // Generate a new key if none exists or if the active key is expired
        keyRepository.findFirstByOrderByCreatedDateDesc().ifPresentOrElse(activeKey -> {
            if (activeKey.isExpired()) {
                createAndStoreNewKey(now);
            } else {
                cachedSigningKey = decodeKey(activeKey.getSecretKey());
                logger.info("Using existing JWT signing key (ID: {}).", activeKey.getKeyId());
            }
        }, () -> createAndStoreNewKey(now));
    }

    /**
     * Creates and stores a new signing key in the database.
     */
    private void createAndStoreNewKey(Instant now) {
        SecretKey newKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        String encodedKey = Base64.getEncoder().encodeToString(newKey.getEncoded());

        JwtKeys newKeyEntity = new JwtKeys();
        newKeyEntity.setKeyId(UUID.randomUUID().toString());
        newKeyEntity.setSecretKey(encodedKey);
        newKeyEntity.setCreatedDate(now);
        newKeyEntity.setExpirationDate(now.plus(Duration.ofDays(28)));

        keyRepository.save(newKeyEntity);
        cachedSigningKey = newKey;

        logger.info("New JWT signing key created (ID: {}).", newKeyEntity.getKeyId());
    }

    /**
     * Extracts the username (subject) from a JWT token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts a specific claim from a JWT token.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parseClaims(token));
    }

    /**
     * Checks if a JWT token is valid.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (StringUtils.isBlank(token)) {
            logger.warn("JWT token is empty.");
            return false;
        }

        try {
            String username = extractUsername(token);
            return StringUtils.equals(username, userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expired: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generates a JWT token for a user.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = Map.of(
                "roles", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList())
        );
        return generateToken(claims, userDetails);
    }

    /**
     * Generates a JWT token with additional claims.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
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
    }

    /**
     * Retrieves the expiration date from a JWT token.
     */
    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    /**
     * Checks if a JWT token is expired.
     */
    private boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expired: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Parses and extracts claims from a JWT token.
     */
    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw e;
        } catch (JwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    /**
     * Retrieves the active signing key.
     */
    private SecretKey getSignInKey() {
        if (cachedSigningKey == null) {
            cachedSigningKey = keyRepository.findFirstByOrderByCreatedDateDesc()
                    .map(activeKey -> decodeKey(activeKey.getSecretKey()))
                    .orElseThrow(() -> new IllegalStateException("No active signing key found in the database!"));
        }
        return cachedSigningKey;
    }

    /**
     * Decodes a base64-encoded JWT key.
     */
    private SecretKey decodeKey(String encodedKey) {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(encodedKey));
    }
}