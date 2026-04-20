package com.personal.portfolio.service;

import com.personal.portfolio.exception.InvalidPasswordResetTokenException;
import com.personal.portfolio.model.PasswordResetToken;
import com.personal.portfolio.repository.PasswordResetTokenRepository;
import com.personal.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.password-reset.expiration-hours:1}")
    private long passwordResetExpirationHours;

    @Transactional
    public void requestPasswordReset(String email) {
        passwordResetTokenRepository.deleteAllByExpiresAtBefore(Instant.now());

        userRepository.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepository.deleteAllByUser(user);

            var rawToken = emailService.generatePasswordResetToken();
            var token = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(hashToken(rawToken))
                    .expiresAt(Instant.now().plus(passwordResetExpirationHours, ChronoUnit.HOURS))
                    .build();

            passwordResetTokenRepository.save(token);
            emailService.sendPasswordResetEmail(user.getEmail(), rawToken);
            log.info("Created password reset token for user {}", user.getEmail());
        });

        log.info("Processed password reset request for {}", email);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        var tokenHash = hashToken(rawToken);
        var token = passwordResetTokenRepository.findByTokenHashAndExpiresAtAfter(tokenHash, Instant.now())
                .orElseThrow(() -> new InvalidPasswordResetTokenException("Invalid or expired password reset token."));

        var user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setCredentialsNonExpired(true);
        userRepository.save(user);

        passwordResetTokenRepository.deleteAllByUser(user);
        log.info("Password reset completed for user {}", user.getEmail());
    }

    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void purgeExpiredTokens() {
        passwordResetTokenRepository.deleteAllByExpiresAtBefore(Instant.now());
    }

    private String hashToken(String token) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to hash password reset token.", e);
        }
    }
}
