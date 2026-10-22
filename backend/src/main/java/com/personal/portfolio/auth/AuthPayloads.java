package com.personal.portfolio.auth;

import module java.base;

import com.personal.portfolio.mail.MailAddress;
import com.personal.portfolio.security.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthPayloads {

    private static final String REDACTED = "<redacted>";
    private static final int MAX_SECRET = 128;

    private AuthPayloads() {}

    public record Registration(@NotBlank @Size(max = 100) String fullName, @NotBlank @MailAddress String email, @StrongPassword String password) {
        @Override
        public String toString() {
            return "Registration[fullName=%s, email=%s, password=%s]".formatted(fullName, email, REDACTED);
        }
    }

    public record Credentials(@NotBlank @MailAddress String email, @NotBlank @Size(max = MAX_SECRET) String password) {
        @Override
        public String toString() {
            return "Credentials[email=%s, password=%s]".formatted(email, REDACTED);
        }
    }

    public record TokenRequest(@NotBlank @Size(max = MAX_SECRET) String token) {
        @Override
        public String toString() {
            return "TokenRequest[token=%s]".formatted(REDACTED);
        }
    }

    public record EmailRequest(@NotBlank @MailAddress String email) { }

    public record RefreshRequest(@NotBlank @Size(max = MAX_SECRET) String refreshToken) {
        @Override
        public String toString() {
            return "RefreshRequest[refreshToken=%s]".formatted(REDACTED);
        }
    }

    public record PasswordReset(@NotBlank @Size(max = MAX_SECRET) String token, @StrongPassword String newPassword) {
        @Override
        public String toString() {
            return "PasswordReset[token=%s, newPassword=%s]".formatted(REDACTED, REDACTED);
        }
    }

    public record PasswordChange(@NotBlank @Size(max = MAX_SECRET) String currentPassword, @StrongPassword String newPassword) {
        @Override
        public String toString() {
            return "PasswordChange[currentPassword=%s, newPassword=%s]".formatted(REDACTED, REDACTED);
        }
    }

    public record ProfileUpdate(@NotBlank @Size(max = 100) String fullName) {
    }

    public record TokenPair(String tokenType, String accessToken, Instant accessTokenExpiresAt, long expiresIn, String refreshToken, Instant refreshTokenExpiresAt) {
        @Override
        public String toString() {
            return "TokenPair[tokenType=%s, accessToken=%s, accessTokenExpiresAt=%s, expiresIn=%d, refreshToken=%s, refreshTokenExpiresAt=%s]"
                .formatted(tokenType, REDACTED, accessTokenExpiresAt, expiresIn, REDACTED, refreshTokenExpiresAt);
        }
    }
}
