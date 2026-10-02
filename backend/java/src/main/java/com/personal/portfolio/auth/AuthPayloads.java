package com.personal.portfolio.auth;

import com.personal.portfolio.mail.MailAddress;
import com.personal.portfolio.security.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

final class AuthPayloads {

    private static final String REDACTED = "<redacted>";

    // Longer than any real password or token, short enough to reject junk before it reaches bcrypt.
    private static final int MAX_SECRET = 128;

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

    public record Credentials(@NotBlank @MailAddress String email, @NotBlank @Size(max = MAX_SECRET) String password) {

        @Override
        public String toString() {
            return "Credentials[email=" + email + ", password=" + REDACTED + "]";
        }
    }

    public record TokenRequest(@NotBlank @Size(max = MAX_SECRET) String token) {

        @Override
        public String toString() {
            return "TokenRequest[token=" + REDACTED + "]";
        }
    }

    public record EmailRequest(@NotBlank @MailAddress String email) { }

    public record RefreshRequest(@NotBlank @Size(max = MAX_SECRET) String refreshToken) {

        @Override
        public String toString() {
            return "RefreshRequest[refreshToken=" + REDACTED + "]";
        }
    }

    public record PasswordReset(@NotBlank @Size(max = MAX_SECRET) String token, @StrongPassword String newPassword) {

        @Override
        public String toString() {
            return "PasswordReset[token=" + REDACTED + ", newPassword=" + REDACTED + "]";
        }
    }

    public record PasswordChange(
        @NotBlank @Size(max = MAX_SECRET) String currentPassword, @StrongPassword String newPassword) {

        @Override
        public String toString() {
            return "PasswordChange[currentPassword=" + REDACTED + ", newPassword=" + REDACTED + "]";
        }
    }

    public record ProfileUpdate(@NotBlank @Size(max = 100) String fullName) { }

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
