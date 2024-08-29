package com.personal.portfolio.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.personal.portfolio.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	/**
	 * Find a user by their email address.
	 * 
	 * @param email the email of the user
	 * @return an Optional containing the user if found, otherwise empty
	 */
	Optional<User> findByEmail(String email);

	/**
	 * Check if a user exists with the given email address.
	 * 
	 * @param email the email of the user
	 * @return true if a user with the given email exists, otherwise false
	 */
	boolean existsByEmail(String email);

	/**
	 * Update the lock status of a user identified by their ID.
	 * 
	 * @param id     the ID of the user
	 * @param locked the new lock status
	 * @return the number of rows affected
	 */
	@Modifying
	@Transactional
	@Query("UPDATE User u SET u.locked = :locked WHERE u.id = :id")
	int updateLockStatusById(@Param("id") Long id, @Param("locked") boolean locked);
}