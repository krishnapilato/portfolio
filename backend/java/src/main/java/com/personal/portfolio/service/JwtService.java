package com.personal.portfolio.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

	@Value("${security.jwt.secret-key}")
	private String secretKey;

	@Value("${security.jwt.expiration-time}")
	private long jwtExpiration;

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles",
				userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
		return generateToken(claims, userDetails);
	}

	@SuppressWarnings("deprecation")
	public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
		return Jwts.builder().setClaims(extraClaims).setSubject(userDetails.getUsername()).setIssuer("krishnapilato")
				.setAudience("audience").setIssuedAt(Date.from(Instant.now()))
				.setExpiration(Date.from(Instant.now().plusMillis(jwtExpiration)))
				.signWith(getSignInKey(), SignatureAlgorithm.HS256).compact();
	}

	public long getExpirationTime() {
		return jwtExpiration;
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		try {
			final String username = extractUsername(token);
			return username.equals(userDetails.getUsername()) && !isTokenExpired(token) && isTokenIssuedByUs(token)
					&& isValidAudience(token);
		} catch (JwtException e) {
			return false;
		}
	}

	private boolean isTokenIssuedByUs(String token) {
		String issuer = extractClaim(token, Claims::getIssuer);
		return "krishnapilato".equals(issuer);
	}

	private boolean isValidAudience(String token) {
		Object audienceClaim = extractClaim(token, Claims::getAudience);
		if (audienceClaim instanceof String) {
			return "audience".equals(audienceClaim);
		} else if (audienceClaim instanceof List) {
			@SuppressWarnings("unchecked")
			List<String> audienceList = (List<String>) audienceClaim;
			return audienceList.contains("audience");
		} else {
			return false;
		}
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	private Claims extractAllClaims(String token) {
		try {
			String[] parts = token.split("\\.");
			if (parts.length != 3) {
				throw new RuntimeException("Invalid JWT token format");
			}

			String base64EncodedPayload = parts[1];
			byte[] decodedBytes = Base64.getUrlDecoder().decode(base64EncodedPayload);
			String jsonPayload = new String(decodedBytes, StandardCharsets.UTF_8);

			ObjectMapper objectMapper = new ObjectMapper();
			return objectMapper.readValue(jsonPayload, Claims.class);
		} catch (Exception e) {
			throw new RuntimeException("Invalid JWT token: " + e.getMessage());
		}
	}

	private Key getSignInKey() {
		byte[] keyBytes = Decoders.BASE64.decode(secretKey);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}