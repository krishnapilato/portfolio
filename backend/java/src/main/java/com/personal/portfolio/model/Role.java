package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

import java.util.*;

/**
 * Enum representing user roles in the application.
 */
@Getter
public enum Role {

    USER("User"),
    ADMIN("Admin"),
    DEVELOPER("Developer");

    private final String displayName;

    // Efficiently map display names to roles using HashMap (EnumMap is not possible here)
    private static final Map<String, Role> DISPLAY_NAME_TO_ROLE = new HashMap<>();

    // Cached list of all available display names for error messages
    private static final String AVAILABLE_ROLES;

    static {
        StringJoiner joiner = new StringJoiner(", ");
        for (Role role : values()) {
            DISPLAY_NAME_TO_ROLE.put(role.displayName.toLowerCase(), role);
            joiner.add(role.displayName);
        }
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
     * Retrieves a Role enum based on the provided display name.
     *
     * @param displayName The display name of the role.
     * @return The Role corresponding to the display name.
     * @throws IllegalArgumentException if the display name is null, blank, or invalid.
     */
    public static Role fromDisplayName(String displayName) {
        Objects.requireNonNull(displayName, "Display name cannot be null.");
        Role role = DISPLAY_NAME_TO_ROLE.get(displayName.toLowerCase());
        if (role == null) {
            throw new IllegalArgumentException("Invalid role: '" + displayName + "'. Available roles: " + AVAILABLE_ROLES);
        }
        return role;
    }

    /**
     * Jackson deserialization support: Converts a JSON string into an enum value.
     */
    @JsonCreator
    public static Role fromDisplayNameForJson(String displayName) {
        return fromDisplayName(displayName);
    }

    /**
     * Retrieves all available role display names as a single string.
     *
     * @return Comma-separated role names.
     */
    public static String getAllDisplayNames() {
        return AVAILABLE_ROLES;
    }
}