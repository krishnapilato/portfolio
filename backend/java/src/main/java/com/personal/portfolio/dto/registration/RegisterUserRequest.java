package com.personal.portfolio.dto.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterUserRequest {

	@NotBlank(message = "Full name is required")
	private String fullName;

	@Email(message = "Email should be valid")
	@NotBlank(message = "Email is required")
	private String email;

	@NotBlank(message = "Password is required")
	private String password;

	public RegisterUserRequest() {}

	public RegisterUserRequest(String fullName, String email, String password) {
		this.fullName = fullName;
		this.email = email;
		this.password = password;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	@Override
	public String toString() {
		return "RegisterUserRequest{" +
				"fullName='" + fullName + '\'' +
				", email='" + email + '\'' +
				", password='" + password + '\'' +
				'}';
	}
}
