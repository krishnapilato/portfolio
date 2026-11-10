package com.example.core.security;

import module java.base;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/// Reads the realm roles Keycloak puts in an access token, as `ROLE_` authorities.
public final class RealmRoles implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        var access = jwt.getClaimAsMap("realm_access");
        if (access == null || !(access.get("roles") instanceof Collection<?> roles)) return List.of();
        return roles.stream().<GrantedAuthority>map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();
    }
}
