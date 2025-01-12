package com.personal.portfolio.dto.login;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for capturing user login request data.
 * Includes validation annotations to ensure proper input format.
 */
public record LoginUserRequest(

        @NotBlank(message = "Email is required") @Email(message = "Email should be valid") @Size(max = 100, message = "Email must not exceed 100 characters") String email,

        @NotBlank(message = "Password is required") @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters") @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,100}$", message = "Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character") String password) {
}