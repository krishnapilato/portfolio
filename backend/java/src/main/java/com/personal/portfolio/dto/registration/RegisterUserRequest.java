package com.personal.portfolio.dto.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        @Size(max = 100)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100)
        String password
) {}