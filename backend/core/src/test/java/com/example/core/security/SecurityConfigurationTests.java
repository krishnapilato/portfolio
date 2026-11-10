package com.example.core.security;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.core.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class SecurityConfigurationTests extends IntegrationTest {

    private static final RealmRoles ROLES = new RealmRoles();

    @Test
    void readsTheRealmRolesTheProviderGranted() {
        var jwt = token(Map.of("realm_access", Map.of("roles", List.of("admin", "user"))));

        assertThat(ROLES.convert(jwt)).extracting(GrantedAuthority::getAuthority)
            .containsExactly("ROLE_admin", "ROLE_user");
    }

    @Test
    void grantsNoRoleWithoutRealmAccess() {
        assertThat(ROLES.convert(token(Map.of("scope", "openid")))).isEmpty();
        assertThat(ROLES.convert(token(Map.of("realm_access", Map.of("roles", "admin"))))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"/", "/assets/core.css", "/v3/api-docs", "/actuator/health", "/actuator/info"})
    void servesPublicPagesWithoutSigningIn(String path) {
        assertThat(mvc.get().uri(path)).hasStatusOk();
    }

    @Test
    void servesThePathsAServiceDeclaresPublic() {
        assertThat(mvc.get().uri("/probe/open/greeting")).hasStatusOk().hasBodyTextEqualTo("hello");
    }

    @Test
    void asksForATokenEverywhereElse() {
        assertThat(mvc.get().uri("/probe/items/lamp"))
            .hasStatus(HttpStatus.UNAUTHORIZED)
            .containsHeader(HttpHeaders.WWW_AUTHENTICATE);
    }

    @Test
    void keepsOperationalEndpointsForAdministrators() {
        assertThat(mvc.get().uri("/actuator/metrics").with(signedIn("user"))).hasStatus(HttpStatus.FORBIDDEN);
        assertThat(mvc.get().uri("/actuator/metrics").with(signedIn("admin"))).hasStatusOk();
    }

    @Test
    void sendsProtectiveHeaders() {
        assertThat(mvc.get().uri("/").secure(true))
            .hasHeader("Strict-Transport-Security", "max-age=31536000 ; includeSubDomains")
            .hasHeader("Referrer-Policy", "same-origin")
            .hasHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
            .hasHeader("X-Frame-Options", "DENY");
    }

    @Test
    void letsConfiguredOriginsCallTheApi() {
        assertThat(mvc.options().uri("/probe/items")
            .header(HttpHeaders.ORIGIN, "http://localhost:5173")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PATCH")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization,x-request-id"))
            .hasStatusOk()
            .hasHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173")
            .hasHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,PATCH,DELETE,OPTIONS")
            .hasHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "authorization, x-request-id")
            .hasHeader(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600")
            .doesNotContainHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
    }

    @Test
    void exposesTheHeadersAClientNeedsToRead() {
        assertThat(mvc.get().uri("/").header(HttpHeaders.ORIGIN, "http://localhost:5173"))
            .hasHeader(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "X-Request-Id, Location, Retry-After");
    }

    @Test
    void refusesOtherOrigins() {
        assertThat(mvc.options().uri("/probe/items")
            .header(HttpHeaders.ORIGIN, "https://attacker.example")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
            .hasStatus(HttpStatus.FORBIDDEN);
    }

    private static Jwt token(Map<String, Object> claims) {
        return Jwt.withTokenValue("token").header("alg", "RS256").subject("someone").claims(all -> all.putAll(claims)).build();
    }
}
