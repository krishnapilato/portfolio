package com.personal.portfolio.dto.user;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        String phoneNumber,
        boolean enabled,
        boolean locked,
        Instant lastLogin,
        String profilePictureUrl,
        String bio,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.isEnabled(),
                user.isLocked(),
                user.getLastLogin(),
                user.getProfilePictureUrl(),
                user.getBio(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
