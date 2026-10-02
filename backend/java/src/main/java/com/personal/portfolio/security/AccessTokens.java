package com.personal.portfolio.security;

import com.personal.portfolio.platform.AppProperties;
import com.personal.portfolio.user.User;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccessTokens {

    private static final String ROLES_CLAIM = "roles";
    private static final String SESSION_CLAIM = "session_version";

    private static final JwsHeader HEADER = JwsHeader.with(MacAlgorithm.HS256).build();

    private final JwtEncoder encoder;
    private final AppProperties properties;
    private final Clock clock;

    public AccessToken issue(User user) {
        var security = properties.security();
        var now = clock.instant();
        var issuedAt = now.truncatedTo(ChronoUnit.SECONDS);
        var expiresAt = issuedAt.plus(security.accessTokenTtl());
        var claims = JwtClaimsSet.builder()
                .issuer(security.issuer())
                .audience(List.of(security.audience()))
                .subject(Long.toString(user.getId()))
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .id(UUID.ofEpochMillis(now.toEpochMilli()).toString())
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .claim(ROLES_CLAIM, List.of(user.getRole().name()))
                .claim(SESSION_CLAIM, user.getSessionVersion())
                .build();
        var token = encoder.encode(JwtEncoderParameters.from(HEADER, claims));
        return new AccessToken(token.getTokenValue(), expiresAt);
    }

    public static long userId(Jwt jwt) {
        return Long.parseLong(jwt.getSubject());
    }

    // A token without the claim belongs to no session, so it can never match.
    public static int sessionVersion(Jwt jwt) {
        return jwt.getClaims().get(SESSION_CLAIM) instanceof Number version ? version.intValue() : -1;
    }

    public record AccessToken(String value, Instant expiresAt) {

        @Override
        public String toString() {
            return "AccessToken[value=<redacted>, expiresAt=" + expiresAt + "]";
        }
    }
}
