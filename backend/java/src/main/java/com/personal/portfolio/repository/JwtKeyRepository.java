package com.personal.portfolio.repository;

import com.personal.portfolio.model.JwtKey;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface JwtKeyRepository extends JpaRepository<JwtKey, Long> {

    Optional<JwtKey> findFirstByOrderByCreatedDateDesc();

    List<JwtKey> findByExpirationDateBefore(Instant threshold);

    boolean existsByExpirationDateAfter(Instant now);

    List<JwtKey> findByExpirationDateAfterOrderByCreatedDateDesc(Instant now, Pageable pageable);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtKey k WHERE k.expirationDate < :threshold")
    void deleteExpiredKeys(Instant threshold);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtKey k WHERE k.keyId = :keyId")
    void deleteByKeyId(String keyId);
}