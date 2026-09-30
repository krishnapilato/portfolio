package com.personal.portfolio.auth;

import com.personal.portfolio.mail.MailAddress;
import com.personal.portfolio.security.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

final class AuthPayloads {

    private static final String REDACTED = "<redacted>";

    private AuthPayloads() {}

    public record Registration(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @MailAddress String email,
            @StrongPassword String password) {

        @Override
        public String toString() {
            return "Registration[fullName=" + fullName + ", email=" + email + ", password=" + REDACTED + "]";
        }
    }

    public record Credentials(@NotBlank @MailAddress String email, @NotBlank String password) {

        @Override
        public String toString() {
            return "Credentials[email=" + email + ", password=" + REDACTED + "]";
        }
    }

    public record TokenRequest(@NotBlank String token) {

        @Override
        public String toString() {
            return "TokenRequest[token=" + REDACTED + "]";
        }
    }

    public record EmailRequest(@NotBlank @MailAddress String email) {}

    public record RefreshRequest(@NotBlank String refreshToken) {

        @Override
        public String toString() {
            return "RefreshRequest[refreshToken=" + REDACTED + "]";
        }
    }

    public record PasswordReset(@NotBlank String token, @StrongPassword String newPassword) {

        @Override
        public String toString() {
            return "PasswordReset[token=" + REDACTED + ", newPassword=" + REDACTED + "]";
        }
    }

    public record PasswordChange(@NotBlank String currentPassword, @StrongPassword String newPassword) {

        @Override
        public String toString() {
            return "PasswordChange[currentPassword=" + REDACTED + ", newPassword=" + REDACTED + "]";
        }
    }

    public record ProfileUpdate(@NotBlank @Size(max = 100) String fullName) {}

    public record TokenPair(
            String tokenType,
            String accessToken,
            Instant accessTokenExpiresAt,
            long expiresIn,
            String refreshToken,
            Instant refreshTokenExpiresAt) {

        @Override
        public String toString() {
            return "TokenPair[tokenType=" + tokenType + ", accessToken=" + REDACTED
                    + ", accessTokenExpiresAt=" + accessTokenExpiresAt + ", expiresIn=" + expiresIn
                    + ", refreshToken=" + REDACTED + ", refreshTokenExpiresAt=" + refreshTokenExpiresAt + "]";
        }
    }
}
