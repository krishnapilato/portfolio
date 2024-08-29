package com.personal.portfolio.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.personal.portfolio.model.JwtKeys;

@Repository
public interface JwtKeysRepository extends JpaRepository<JwtKeys, Long> {

	/**
	 * Retrieve the most recently created JwtKeys entity.
	 * 
	 * @return an Optional containing the most recent JwtKeys if found, otherwise empty
	 */
	Optional<JwtKeys> findTopByOrderByCreatedDateDesc();

	/**
	 * Find all JwtKeys entities where the expiration date is before the specified date.
	 * 
	 * @param  expirationDate the date to compare against the expiration date
	 * @return a list of JwtKeys entities with expiration dates before the specified date
	 */
	@Query("SELECT k FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	List<JwtKeys> findAllByExpirationDateBefore(@Param("expirationDate") Instant expirationDate);

	/**
	 * Delete all JwtKeys entities where the expiration date is before the specified date.
	 * 
	 * @param expirationDate the date to compare against the expiration date
	 */
	@Modifying
	@Transactional
	@Query("DELETE FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	void deleteAllByExpirationDateBefore(@Param("expirationDate") Instant expirationDate);
}