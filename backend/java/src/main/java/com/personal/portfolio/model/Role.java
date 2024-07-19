package com.personal.portfolio.model;

public enum Role {
	USER("User"), 
	ADMIN("Admin"), 
	DEVELOPER("Developer");

	private final String displayName;

	Role(String displayName) {
		this.displayName = displayName;
	}

	public String getDisplayName() {
		return displayName;
	}
}