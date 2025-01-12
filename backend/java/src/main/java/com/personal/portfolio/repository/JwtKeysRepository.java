package com.personal.portfolio.repository;

import com.personal.portfolio.model.JwtKeys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing {@link JwtKeys} entities.
 * Provides methods for accessing and manipulating JWT key data.
 */
@Repository
@Transactional(readOnly = true) // Since it's just reading data, we can make the repository read-only for performance.
public interface JwtKeysRepository extends JpaRepository<JwtKeys, Long> {

    /**
     * Finds the most recently created JWT key.
     *
     * @return An {@link Optional} containing the most recent {@link JwtKeys},
     * or empty if no keys exist.
     */
    Optional<JwtKeys> findFirstByOrderByCreatedDateDesc();

    /**
     * Retrieves a list of expired JWT keys based on the provided expiration date.
     *
     * @param expirationDate The date to compare expiration dates against.
     * @return A list of expired {@link JwtKeys}.
     */
    @Query("SELECT k FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
    List<JwtKeys> findExpiredKeys(@Param("expirationDate") Instant expirationDate);
}