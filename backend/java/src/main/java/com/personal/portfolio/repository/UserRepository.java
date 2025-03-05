package com.personal.portfolio.repository;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing {@link User} entities.
 * Provides methods to perform CRUD operations and custom queries for user management.
 */
@Repository
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
     * Finds all users by their role.
     *
     * @param role The role to filter users.
     * @return A list of users having the specified role.
     */
    List<User> findByRole(Role role);

    /**
     * Finds all users by role with pagination.
     *
     * @param role The role to filter users.
     * @param pageable Pageable object to support pagination.
     * @return A paginated list of users.
     */
    Page<User> findByRole(Role role, Pageable pageable);

    /**
     * Finds users who haven't logged in since a given date.
     *
     * @param lastLoginThreshold The cutoff date for checking inactivity.
     * @return A list of inactive users.
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :lastLoginThreshold")
    List<User> findInactiveUsers(@Param("lastLoginThreshold") Instant lastLoginThreshold);

    /**
     * Finds all locked accounts.
     *
     * @return A list of locked users.
     */
    @Query("SELECT u FROM User u WHERE u.locked = true")
    List<User> findLockedUsers();

    /**
     * Locks or unlocks a user based on their ID.
     *
     * @param id The ID of the user.
     * @param locked The new lock status.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE User u SET u.locked = :locked WHERE u.id = :id")
    void updateLockStatus(@Param("id") Long id, @Param("locked") boolean locked);

    /**
     * Updates the last login timestamp for a specific user.
     *
     * @param userId The ID of the user.
     * @param lastLogin The timestamp of the last login.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("lastLogin") Instant lastLogin);

    /**
     * Locks all inactive users who haven't logged in since a given date.
     *
     * @param lastLoginThreshold The cutoff date for inactivity.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE User u SET u.locked = true WHERE u.lastLogin IS NULL OR u.lastLogin < :lastLoginThreshold")
    void lockInactiveUsers(@Param("lastLoginThreshold") Instant lastLoginThreshold);

    /**
     * Deletes all users who haven't logged in since a specific date.
     *
     * @param lastLoginThreshold The cutoff date for deletion.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :lastLoginThreshold")
    void deleteInactiveUsers(@Param("lastLoginThreshold") Instant lastLoginThreshold);

    /**
     * Changes the role of a user.
     *
     * @param userId The ID of the user.
     * @param newRole The new role to be assigned.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE User u SET u.role = :newRole WHERE u.id = :userId")
    void updateUserRole(@Param("userId") Long userId, @Param("newRole") Role newRole);
}