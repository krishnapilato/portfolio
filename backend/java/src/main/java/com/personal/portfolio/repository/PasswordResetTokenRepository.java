package com.personal.portfolio.repository;

import com.personal.portfolio.model.PasswordResetToken;
import com.personal.portfolio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    void deleteAllByUser(User user);

    void deleteAllByExpiresAtBefore(Instant threshold);
}
