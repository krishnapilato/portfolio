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
@Transactional
public interface JwtKeysRepository extends JpaRepository<JwtKeys, Long> {

	Optional<JwtKeys> findTopByOrderByCreatedDateDesc();

	@Query("SELECT k FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	List<JwtKeys> findExpiredKeys(@Param("expirationDate") Instant expirationDate);

	@Modifying
	@Query("DELETE FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	void deleteExpiredKeys(@Param("expirationDate") Instant expirationDate);
}