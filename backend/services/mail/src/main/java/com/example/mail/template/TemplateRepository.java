package com.example.mail.template;

import module java.base;

import org.springframework.data.jpa.repository.JpaRepository;

interface TemplateRepository extends JpaRepository<MessageTemplate, UUID> {

    Optional<MessageTemplate> findByName(String name);

    List<MessageTemplate> findAllByOrderByName();
}
