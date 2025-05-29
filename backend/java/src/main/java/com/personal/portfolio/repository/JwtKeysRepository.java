package com.personal.portfolio.repository;

import com.personal.portfolio.model.JwtKeys;
import org.springdoc.core.converters.models.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing {@link JwtKeys} entities.
 * Provides methods for accessing, managing, and cleaning up expired JWT keys.
 */
@Repository
public interface JwtKeysRepository extends JpaRepository<JwtKeys, Long> {

    Optional<JwtKeys> findFirstByOrderByCreatedDateDesc();

    @Query("SELECT k FROM JwtKeys k WHERE k.expirationDate < :threshold")
    List<JwtKeys> findExpiredKeys(@Param("threshold") Instant threshold);

    @Query("SELECT COUNT(k) > 0 FROM JwtKeys k WHERE k.expirationDate > :now")
    boolean existsValidKey(@Param("now") Instant now);

    @Query("SELECT k FROM JwtKeys k WHERE k.expirationDate > :now ORDER BY k.createdDate DESC")
    List<JwtKeys> findLatestValidKeys(@Param("now") Instant now, Pageable pageable);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtKeys k WHERE k.expirationDate < :threshold")
    void deleteExpiredKeys(@Param("threshold") Instant threshold);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM JwtKeys k WHERE k.keyId = :keyId")
    void deleteByKeyId(@Param("keyId") String keyId);
}