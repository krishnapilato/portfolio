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
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service for managing JSON Web Tokens (JWT).
 * Includes functionality for generating, validating, and rotating JWT secret keys.
 */
@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private static final ReentrantLock lock = new ReentrantLock();

    @Value("${jwt.token.expiration:7200000}")
    private final long tokenExpiration;

    private final JwtKeysRepository keyRepository;
    private volatile SecretKey cachedSigningKey;

    public JwtService(long tokenExpiration, JwtKeysRepository keyRepository) {
        this.tokenExpiration = tokenExpiration;
        this.keyRepository = keyRepository;
        rotateKey(); // Initialize key on startup
    }

    /**
     * Scheduled task to rotate the secret key daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void rotateKey() {
        lock.lock();
        try {
            Instant now = Instant.now();
            cleanupExpiredKeys(now);
            keyRepository.findFirstByOrderByCreatedDateDesc()
                    .filter(activeKey -> !activeKey.isExpired())
                    .ifPresentOrElse(
                            activeKey -> cachedSigningKey = decodeKey(activeKey.getSecretKey()),
                            () -> createAndStoreNewKey(now)
                    );
        } finally {
            lock.unlock();
        }
    }

    private void cleanupExpiredKeys(Instant now) {
        List<JwtKeys> expiredKeys = keyRepository.findExpiredKeys(now);
        if (!expiredKeys.isEmpty()) {
            keyRepository.deleteAllInBatch(expiredKeys);
            logger.info("Deleted {} expired JWT keys.", expiredKeys.size());
        }
    }

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

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parseClaims(token));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (StringUtils.isBlank(token)) return false;
        try {
            return StringUtils.equals(extractUsername(token), userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expired.");
            return false;
        } catch (JwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(Map.of(
                "roles", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList())
        ), userDetails);
    }

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

    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

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

    public SecretKey getSignInKey() {
        if (cachedSigningKey == null) {
            lock.lock();
            try {
                cachedSigningKey = keyRepository.findFirstByOrderByCreatedDateDesc()
                        .map(activeKey -> decodeKey(activeKey.getSecretKey()))
                        .orElseThrow(() -> new IllegalStateException("No active signing key found in the database!"));
            } finally {
                lock.unlock();
            }
        }
        return cachedSigningKey;
    }

    public SecretKey decodeKey(String encodedKey) {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(encodedKey));
    }
}