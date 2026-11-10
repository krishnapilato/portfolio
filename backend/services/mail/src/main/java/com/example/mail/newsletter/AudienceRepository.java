package com.example.mail.newsletter;

import module java.base;

import org.springframework.data.jpa.repository.JpaRepository;

interface AudienceRepository extends JpaRepository<Audience, UUID> {

    List<Audience> findAllByOrderByName();
}
