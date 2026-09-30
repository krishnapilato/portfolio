package com.personal.portfolio.auth;

import com.personal.portfolio.user.User;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    Optional<UserToken> findByFingerprintAndPurpose(String fingerprint, TokenPurpose purpose);

    boolean existsByUserAndPurposeAndConsumedAtIsNullAndExpiresAtAfter(User user, TokenPurpose purpose, Instant after);

    @Modifying(flushAutomatically = true)
    @Query("update UserToken t set t.consumedAt = :now where t.id = :id and t.consumedAt is null")
    int claim(long id, Instant now);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from UserToken t where t.family = :family")
    int deleteByFamily(String family);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from UserToken t where t.user = :user and t.purpose = :purpose")
    int deleteByUserAndPurpose(User user, TokenPurpose purpose);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from UserToken t where t.expiresAt < :threshold")
    int deleteExpired(Instant threshold);
}
