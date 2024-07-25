package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;

public class RegistrationResponse {
	private String status;
	private String message;
	private Long userId;
	private Role role;

	public RegistrationResponse(Long userId, Role role) {
		this.setStatus("SUCCESS");
		this.setMessage("Registration successful.");
		this.setUserId(userId);
		this.setRole(role);
	}

	public RegistrationResponse(String status, String message) {
		this.setStatus(status);
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

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
}