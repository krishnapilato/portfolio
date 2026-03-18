package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Getter
public enum Role {

    USER("User"), ADMIN("Admin"), DEVELOPER("Developer");

    private final String displayName;

    private static final Map<String, Role> LOOKUP = Arrays.stream(values()).collect(Collectors.toUnmodifiableMap(role -> role.displayName.toLowerCase(), Function.identity()));

    private static final String AVAILABLE_ROLES = Arrays.stream(values()).map(role -> role.displayName).collect(Collectors.joining(", "));

    Role(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }

    public static Role fromDisplayName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Role display name is required.");
        }

        var role = LOOKUP.get(displayName.toLowerCase());
        if (role == null) {
            throw new IllegalArgumentException("Invalid role: [%s]. Supported: [%s]".formatted(displayName, AVAILABLE_ROLES));
        }
        return role;
    }

    @JsonCreator
    public static Role fromJson(String displayName) {
        return fromDisplayName(displayName);
    }

    public static String getAllDisplayNames() {
        return AVAILABLE_ROLES;
    }
}