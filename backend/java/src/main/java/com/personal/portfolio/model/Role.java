package com.personal.portfolio.model;

import lombok.Getter;

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
		for (Role role : values()) {
			if (role.getDisplayName().equalsIgnoreCase(displayName)) {
				return role;
			}
		}
		throw new IllegalArgumentException("No role found for display name: " + displayName);
	}
}