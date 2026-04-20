package com.personal.portfolio.dto.user;

import com.personal.portfolio.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record CreateUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        @Size(max = 100)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100)
        String password,

        Role role,

        @Size(max = 20)
        @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Phone number format is invalid")
        String phoneNumber,

        @URL(message = "Profile picture URL must be valid")
        @Size(max = 500)
        String profilePictureUrl,

        @Size(max = 500)
        String bio
) {
}
