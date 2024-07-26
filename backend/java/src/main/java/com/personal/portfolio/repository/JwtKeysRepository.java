package com.personal.portfolio.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.personal.portfolio.model.JwtKeys;

@Repository
public interface JwtKeysRepository extends JpaRepository<JwtKeys, Long> {

	@Query("SELECT k FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	List<JwtKeys> findAllByExpirationDateBefore(Instant expirationDate);

	@Modifying
	@Transactional
	@Query("DELETE FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	void deleteAllByExpirationDateBefore(Instant expirationDate);

	@Query("SELECT k FROM JwtKeys k ORDER BY k.createdDate DESC")
	Optional<JwtKeys> findFirstByOrderByCreatedDateDesc();
}