package com.personal.portfolio.repository;

import com.personal.portfolio.model.JwtKeys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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

    /**
     * Checks if there is an active JWT key that is not expired.
     *
     * @param currentTime The current timestamp.
     * @return True if a valid key exists, otherwise false.
     */
    @Query("SELECT COUNT(k) > 0 FROM JwtKeys k WHERE k.expirationDate > :currentTime")
    boolean existsValidKey(@Param("currentTime") Instant currentTime);

    /**
     * Retrieves the latest valid (non-expired) JWT key.
     *
     * @param currentTime The current timestamp.
     * @return The most recent non-expired {@link JwtKeys}, if available.
     */
    @Query("SELECT k FROM JwtKeys k WHERE k.expirationDate > :currentTime ORDER BY k.createdDate DESC")
    Optional<JwtKeys> findLatestValidKey(@Param("currentTime") Instant currentTime);

    /**
     * Deletes all expired JWT keys to clean up the database.
     *
     * @param expirationDate The expiration threshold date.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
    void deleteExpiredKeys(@Param("expirationDate") Instant expirationDate);

    /**
     * Deletes a specific key by its unique key ID.
     *
     * @param keyId The unique identifier of the JWT key.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM JwtKeys k WHERE k.keyId = :keyId")
    void deleteByKeyId(@Param("keyId") String keyId);
}