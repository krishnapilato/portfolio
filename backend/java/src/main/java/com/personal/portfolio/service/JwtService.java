package com.personal.portfolio.service;

import com.personal.portfolio.model.JwtKey;
import com.personal.portfolio.repository.JwtKeyRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    private static final ReentrantLock lock = new ReentrantLock();

    private final long tokenExpiration;
    private final JwtKeyRepository keyRepository;
    private volatile SecretKey cachedSigningKey;

    public JwtService(@Value("${jwt.token.expiration:7200000}") long tokenExpiration, JwtKeyRepository keyRepository) {
        this.tokenExpiration = tokenExpiration;
        this.keyRepository = keyRepository;
        rotateKey();
    }

    @Transactional
    @Scheduled(cron = "0 0 0 * * ?")
    public void rotateKey() {
        lock.lock();
        try {
            var now = Instant.now();

            keyRepository.deleteExpiredKeys(now);

            keyRepository.findFirstByOrderByCreatedDateDesc()
                    .filter(activeKey -> !activeKey.isExpired())
                    .ifPresentOrElse(
                            activeKey -> cachedSigningKey = decodeKey(activeKey.getSecretKey()),
                            this::createAndStoreNewKey
                    );
        } finally {
            lock.unlock();
        }
    }

    private void createAndStoreNewKey() {
        var newKey = Jwts.SIG.HS512.key().build();
        var encodedKey = Base64.getEncoder().encodeToString(newKey.getEncoded());

        var newKeyEntity = JwtKey.builder()
                .secretKey(encodedKey)
                .build();

        keyRepository.save(newKeyEntity);
        cachedSigningKey = newKey;

        log.info("New JWT signing key created (ID: {}).", newKeyEntity.getKeyId());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (token == null || token.isBlank()) return false;

        try {
            var claims = parseClaims(token);
            var username = claims.getSubject();
            var isExpired = claims.getExpiration().before(new Date());

            return username.equals(userDetails.getUsername()) && !isExpired;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid or expired JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) { return extractClaim(token, Claims::getExpiration); }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parseClaims(token));
    }

    public String generateToken(UserDetails userDetails) {
        var roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return generateToken(Map.of("roles", roles), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        var now = Instant.now();

        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuer("Khova Krishna Pilato")
                .audience().add("com.personal.portfolio").and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(tokenExpiration)))
                .signWith(getSignInKey(), Jwts.SIG.HS512)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public SecretKey getSignInKey() {
        if (cachedSigningKey == null) {
            lock.lock();
            try {
                if (cachedSigningKey == null) {
                    cachedSigningKey = keyRepository.findFirstByOrderByCreatedDateDesc()
                            .map(activeKey -> decodeKey(activeKey.getSecretKey()))
                            .orElseThrow(() -> new IllegalStateException("No active signing key found in the database!"));
                }
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