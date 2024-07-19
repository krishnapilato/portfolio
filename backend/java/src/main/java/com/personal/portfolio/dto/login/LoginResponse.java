package com.personal.portfolio.dto.login;

import com.personal.portfolio.model.Role;

public class LoginResponse {
	private String status;
	private String message;
	private String token;
	private long expiresIn;
	private String errorCode;
	private Role role;

	public LoginResponse(String token, long expiresIn, Role role) {
		this.setStatus("success");
		this.setMessage("Authentication successful.");
		this.setToken(token);
		this.setExpiresIn(expiresIn);
		this.setRole(role);
	}

	public LoginResponse(String errorCode, String message) {
		this.setStatus("error");
		this.setErrorCode(errorCode);
		this.setMessage(message);
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public long getExpiresIn() {
		return expiresIn;
	}

	public void setExpiresIn(long expiresIn) {
		this.expiresIn = expiresIn;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}
	
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}