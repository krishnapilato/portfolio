package com.personal.portfolio.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {
	
	private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
	
	private static final long KEY_ROTATION_INTERVAL_MILLIS = 24 * 60 * 60 * 1000;
	private final Map<Instant, SecretKey> keyCache = new ConcurrentHashMap<>();
	private final long jwtExpirationMillis;
	
    public JwtService() {
    	rotateKey();
        this.jwtExpirationMillis = 7200000;
    }
    
    @Scheduled(cron = "0 0 0 * * ?")
    public void rotateKey() {
        SecretKey newKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        keyCache.put(Instant.now(), newKey);
        logger.info("JWT Secret key rotated.");
        
        keyCache.entrySet().removeIf(entry -> entry.getKey().isBefore(Instant.now().minusMillis(KEY_ROTATION_INTERVAL_MILLIS)));
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
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        try {
            return Jwts.builder()
                    .setClaims(extraClaims)
                    .setSubject(userDetails.getUsername())
                    .setIssuer("krishnapilato")
                    .setAudience("audience")
                    .setIssuedAt(Date.from(Instant.now()))
                    .setExpiration(Date.from(Instant.now().plusMillis(jwtExpirationMillis)))
                    .signWith(getSignInKey(), SignatureAlgorithm.HS512)
                    .compact();
        } catch (JwtException e) {
            logger.error("Error generating JWT token", e);
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public Date extractExpiration(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
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
    	return keyCache.entrySet().stream()
                .max(Map.Entry.comparingByKey())
                .map(Map.Entry::getValue)
                .orElseThrow(() -> new IllegalStateException("No active JWT secret key found!"));
    }
}