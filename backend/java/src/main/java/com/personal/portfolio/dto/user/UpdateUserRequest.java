package com.personal.portfolio.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record UpdateUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100)
        String fullName,

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
