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

    private static final Map<String, Role> DISPLAY_NAME_TO_ROLE = Map.ofEntries(
            Map.entry("user", USER),
            Map.entry("admin", ADMIN),
            Map.entry("developer", DEVELOPER)
    );

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
        return Optional.ofNullable(DISPLAY_NAME_TO_ROLE.get(displayName.toLowerCase()))
                .orElseThrow(() -> new NoSuchElementException("No matching role found for: '" + displayName + "'. Available roles: " + getAllDisplayNames()));
    }

    @JsonCreator
    public static Role fromDisplayNameForJson(String displayName) {
        return fromDisplayName(displayName);
    }

    public static String getAllDisplayNames() {
        return String.join(", ", DISPLAY_NAME_TO_ROLE.keySet());
    }
}