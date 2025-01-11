package com.personal.portfolio.model;

import lombok.Getter;

import java.util.NoSuchElementException;

/**
 * Enum representing user roles in the application.
 * Each role has a display name that is more user-friendly.
 */
@Getter
public enum Role {

    USER("User"), ADMIN("Admin"), DEVELOPER("Developer");

    private final String displayName;

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
     * @throws IllegalArgumentException if the display name is null.
     * @throws NoSuchElementException   if no matching Role is found.
     */
    public static Role fromDisplayName(String displayName) {
        // Validate the input to prevent null values
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Display name cannot be null or blank.");
        }

        // Search for a matching role by display name
        for (Role role : values()) {
            if (role.displayName.equalsIgnoreCase(displayName)) {
                return role;
            }
        }

        // If no role matches, throw an exception with a detailed message
        throw new NoSuchElementException(String.format("No matching role found for display name: '%s'. Available roles: %s", displayName, getAllDisplayNames()));
    }

    /**
     * Retrieves a comma-separated string of all available role display names.
     *
     * @return A string containing all role display names.
     */
    public static String getAllDisplayNames() {
        StringBuilder displayNames = new StringBuilder();
        for (Role role : values()) {
            if (!displayNames.isEmpty()) {
                displayNames.append(", ");
            }
            displayNames.append(role.displayName);
        }
        return displayNames.toString();
    }
}