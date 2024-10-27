package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.model.JwtKeys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public interface JwtKeysRepository extends JpaRepository<JwtKeys, Long> {

	Optional<JwtKeys> findTopByOrderByCreatedDateDesc();

	@Query("SELECT k FROM JwtKeys k WHERE k.expirationDate < :expirationDate")
	List<JwtKeys> findExpiredKeys(@Param("expirationDate") Instant expirationDate);
}