package com.personal.portfolio.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Enum representing user roles in the application.
 * Each role has a display name that is more user-friendly.
 */
@Getter
public enum Role {

    USER("User"), ADMIN("Admin"), DEVELOPER("Developer");

    private final String displayName;

    // Cache for quick lookup of roles by display name
    private static final Map<String, Role> DISPLAY_NAME_TO_ROLE = Arrays.stream(values()).collect(Collectors.toMap(role -> role.displayName.toLowerCase(), role -> role));

    /**
     * Constructor to associate a user-friendly display name with each role.
     *
     * @param displayName The display name for the role.
     */
    Role(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Returns the display name of the role.
     * Overrides the default toString() method for a more readable output.
     *
     * @return A user-friendly display name of the role.
     */
    @Override
    public String toString() {
        return displayName;
    }

    /**
     * Retrieves a Role enum based on the provided display name.
     *
     * @param displayName The display name of the role.
     * @return The Role corresponding to the display name.
     * @throws IllegalArgumentException if the display name is null or blank.
     * @throws NoSuchElementException   if no matching Role is found.
     */
    public static Role fromDisplayName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Display name cannot be null or blank.");
        }
        return Optional.ofNullable(DISPLAY_NAME_TO_ROLE.get(displayName.toLowerCase())).orElseThrow(() -> new NoSuchElementException(String.format("No matching role found for display name: '%s'. Available roles: %s", displayName, getAllDisplayNames())));
    }

    /**
     * Retrieves a Role enum for JSON deserialization based on the provided display name.
     *
     * @param displayName The display name of the role.
     * @return The Role corresponding to the display name.
     */
    @JsonCreator
    public static Role fromDisplayNameForJson(String displayName) {
        return fromDisplayName(displayName);
    }

    /**
     * Retrieves a comma-separated string of all available role display names.
     *
     * @return A string containing all role display names.
     */
    public static String getAllDisplayNames() {
        return Arrays.stream(values()).map(role -> role.displayName).collect(Collectors.joining(", "));
    }
}