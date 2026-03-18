package com.personal.portfolio.repository;

import com.personal.portfolio.model.Role;
import com.personal.portfolio.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    Page<User> findByRole(Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :threshold")
    List<User> findInactiveUsers(Instant threshold);

    List<User> findByLockedTrue();

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.locked = :locked WHERE u.id = :id")
    void updateLockStatus(Long id, boolean locked);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    void updateLastLogin(Long userId, Instant lastLogin);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.locked = true WHERE u.lastLogin IS NULL OR u.lastLogin < :threshold")
    void lockInactiveUsers(Instant threshold);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :threshold")
    void deleteInactiveUsers(Instant threshold);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.role = :newRole WHERE u.id = :userId")
    void updateUserRole(Long userId, Role newRole);
}