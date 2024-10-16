package com.personal.portfolio.dto.login;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginUserRequest {
	@Email(message = "Email should be valid")
	@NotBlank(message = "Email is required")
	private final String email;

	@NotBlank(message = "Password is required")
	private final String password;

	public LoginUserRequest(String email, String password) {
		this.email = email;
		this.password = password;
	}

	public String getEmail() {
		return email;
	}

	public String getPassword() {
		return password;
	}
}