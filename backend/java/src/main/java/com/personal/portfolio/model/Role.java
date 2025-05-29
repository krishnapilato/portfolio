package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

/**
 * Enum representing user roles in the application.
 */
@Getter
public enum Role {

    USER("User"),
    ADMIN("Admin"),
    DEVELOPER("Developer");

    private final String displayName;

    // Efficient mapping for lookup (use EnumMap for enum keys, but here we map by String, so HashMap is fine)
    private static final Map<String, Role> DISPLAY_NAME_TO_ROLE;
    private static final String AVAILABLE_ROLES;

    static {
        Map<String, Role> map = new HashMap<>();
        StringJoiner joiner = new StringJoiner(", ");
        for (Role role : values()) {
            map.put(role.displayName.toLowerCase(), role);
            joiner.add(role.displayName);
        }
        DISPLAY_NAME_TO_ROLE = Collections.unmodifiableMap(map);
        AVAILABLE_ROLES = joiner.toString();
    }

    Role(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }

    /**
     * Retrieve Role enum by display name (case-insensitive).
     *
     * @param displayName the display name.
     * @return the corresponding Role.
     * @throws IllegalArgumentException if display name is null, blank, or invalid.
     */
    public static Role fromDisplayName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Display name cannot be null or blank.");
        }
        Role role = DISPLAY_NAME_TO_ROLE.get(displayName.toLowerCase());
        if (role == null) {
            throw new IllegalArgumentException("Invalid role: '" + displayName + "'. Available roles: " + AVAILABLE_ROLES);
        }
        return role;
    }

    /**
     * Jackson deserialization support.
     *
     * @param displayName JSON string.
     * @return Role.
     */
    @JsonCreator
    public static Role fromJson(String displayName) {
        return fromDisplayName(displayName);
    }

    /**
     * Get all available role display names (comma-separated).
     *
     * @return available roles.
     */
    public static String getAllDisplayNames() {
        return AVAILABLE_ROLES;
    }
}