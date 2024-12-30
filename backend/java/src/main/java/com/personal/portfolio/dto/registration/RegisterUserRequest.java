package com.personal.portfolio.dto.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Represents a user registration request with validation constraints.
 */
public record RegisterUserRequest(

		@NotBlank(message = "Full name is required")
		@Size(max = 100, message = "Full name must not exceed 100 characters")
		String fullName,

		@Email(message = "Email should be valid")
		@NotBlank(message = "Email is required")
		@Size(max = 100, message = "Email must not exceed 100 characters")
		String email,

		@NotBlank(message = "Password is required")
		@Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
		@Pattern(
				regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,50}$",
				message = "Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character"
		)
		String password
) { }