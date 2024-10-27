package com.portfolio.portfolio.model;

import lombok.Getter;

import java.util.NoSuchElementException;

/**
 * Enum representing different user roles.
 */
@Getter
public enum Role {
	USER("User"),
	ADMIN("Admin"),
	DEVELOPER("Developer");

	private final String displayName;

	Role(String displayName) {
		this.displayName = displayName;
	}

	@Override
	public String toString() {
		return displayName;
	}

	/**
	 * Get Role by display name.
	 *
	 * @param displayName the display name of the role
	 * @return Role corresponding to the display name
	 */
	public static Role fromDisplayName(String displayName) {
		if (displayName == null) {
			throw new IllegalArgumentException("Display name cannot be null.");
		}

		for (Role role : values()) {
			if (role.getDisplayName().equalsIgnoreCase(displayName)) {
				return role;
			}
		}

		throw new NoSuchElementException("No role found for display name: " + displayName);
	}
}