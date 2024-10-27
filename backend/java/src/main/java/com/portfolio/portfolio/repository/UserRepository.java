package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
@Transactional
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	@Modifying
	@Transactional
	@Query("UPDATE User u SET u.locked = CASE WHEN u.locked = true THEN false ELSE true END WHERE u.id = :id")
	void updateLockStatusById(@Param("id") Long id);
}