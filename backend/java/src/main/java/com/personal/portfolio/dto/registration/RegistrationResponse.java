package com.personal.portfolio.dto.registration;

import com.personal.portfolio.model.Role;
import java.util.Optional;

public class RegistrationResponse {

	private String status;
	private String message;
	private Long userId;
	private Optional<Role> role;

	public RegistrationResponse() {}

	// Constructor for successful registration
	public RegistrationResponse(Long userId, Role role) {
		this.status = "SUCCESS";
		this.message = "Registration successful.";
		this.userId = userId;
		this.role = Optional.ofNullable(role);
	}

	// Constructor for error response
	public RegistrationResponse(String status, String message) {
		this.status = status;
		this.message = message;
		this.userId = null;
		this.role = Optional.empty();
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

	public Optional<Role> getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = Optional.ofNullable(role);
	}

	@Override
	public String toString() {
		return "RegistrationResponse{" +
				"status='" + status + '\'' +
				", message='" + message + '\'' +
				", userId=" + userId +
				", role=" + role.orElse(null) + // Avoid printing empty Optionals
				'}';
	}
}