package com.personal.portfolio.repository;

import com.personal.portfolio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Repository interface for managing {@link User} entities.
 * Provides methods to perform CRUD operations and custom queries for user management.
 */
@Repository
@Transactional(readOnly = true) // Apply read-only transaction for read operations.
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address.
     *
     * @param email The email address of the user.
     * @return An {@link Optional} containing the user, or empty if no user is found.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists with the given email address.
     *
     * @param email The email address to check.
     * @return True if a user with the email exists, otherwise false.
     */
    boolean existsByEmail(String email);

    /**
     * Toggles the lock status of a user (locked/unlocked) based on their ID.
     *
     * @param id The ID of the user whose lock status will be updated.
     */
    @Modifying
    @Transactional // Add transactional annotation for modifying queries.
    @Query("UPDATE User u SET u.locked = CASE WHEN u.locked = true THEN false ELSE true END WHERE u.id = :id")
    void updateLockStatusById(@Param("id") Long id);
}