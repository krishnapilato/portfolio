package com.personal.portfolio.dto.login;

import com.personal.portfolio.model.Role;

public class LoginResponse {
	private final String status;
	private final String message;
	private final String token;
	private final long expiresIn;
	private final String errorCode;
	private final Role role;

	public LoginResponse(String token, long expiresIn, Role role) {
		this.status = "success";
		this.message = "Authentication successful.";
		this.token = token;
		this.expiresIn = expiresIn;
		this.role = role;
		this.errorCode = null;
	}

	public LoginResponse(String errorCode, String message) {
		this.status = "error";
		this.errorCode = errorCode;
		this.message = message;
		this.token = null;
		this.expiresIn = 0;
		this.role = null;
	}

	public String getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}

	public String getToken() {
		return token;
	}

	public long getExpiresIn() {
		return expiresIn;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public Role getRole() {
		return role;
	}
}