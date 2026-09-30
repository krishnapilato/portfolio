package com.personal.portfolio.user;

import com.personal.portfolio.mail.MailAddress;
import com.personal.portfolio.security.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Map;
import org.jspecify.annotations.Nullable;

public final class UserPayloads {

    private UserPayloads() {}

    public record UserView(
            long id,
            String fullName,
            String email,
            Role role,
            AccountStatus status,
            @Nullable Instant lastLoginAt,
            Instant createdAt,
            Instant updatedAt) {

        public static UserView of(User user) {
            return new UserView(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStatus(),
                    user.getLastLoginAt(), user.getCreatedAt(), user.getUpdatedAt());
        }
    }

    public record CreateUser(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @MailAddress String email,
            @StrongPassword String password,
            @NotNull Role role) {

        @Override
        public String toString() {
            return "CreateUser[fullName=" + fullName + ", email=" + email + ", password=<redacted>, role=" + role + "]";
        }
    }

    public record UpdateUser(
            @Nullable @Size(max = 100) @Pattern(regexp = "(?s).*\\S.*", message = "must not be blank") String fullName,
            @Nullable Role role) {}

    public record StatusChange(@NotNull AccountStatus status) {}

    public record UserStats(long total, Map<AccountStatus, Long> byStatus, Map<Role, Long> byRole) {}
}
