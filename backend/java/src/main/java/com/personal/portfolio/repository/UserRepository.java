package com.personal.portfolio.repository;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
 * Repository interface for managing {@link User} entities.
 * Provides methods to perform CRUD operations and advanced user queries.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    Page<User> findByRole(Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :threshold")
    List<User> findInactiveUsers(@Param("threshold") Instant threshold);

    @Query("SELECT u FROM User u WHERE u.locked = true")
    List<User> findLockedUsers();

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.locked = :locked WHERE u.id = :id")
    void updateLockStatus(@Param("id") Long id, @Param("locked") boolean locked);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("lastLogin") Instant lastLogin);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.locked = true WHERE u.lastLogin IS NULL OR u.lastLogin < :threshold")
    void lockInactiveUsers(@Param("threshold") Instant threshold);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :threshold")
    void deleteInactiveUsers(@Param("threshold") Instant threshold);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.role = :newRole WHERE u.id = :userId")
    void updateUserRole(@Param("userId") Long userId, @Param("newRole") Role newRole);
}