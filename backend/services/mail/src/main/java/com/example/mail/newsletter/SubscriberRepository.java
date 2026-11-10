package com.example.mail.newsletter;

import module java.base;

import org.springframework.data.jpa.repository.JpaRepository;

interface SubscriberRepository extends JpaRepository<Subscriber, UUID> {

    Optional<Subscriber> findByAudienceIdAndEmail(UUID audienceId, String email);

    List<Subscriber> findAllByAudienceIdOrderByCreatedAt(UUID audienceId);

    List<Subscriber> findAllByAudienceIdAndStatus(UUID audienceId, Subscriber.Status status);
}
