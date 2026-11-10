package com.example.mail.delivery;

import module java.base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findAllByOrderByCreatedAtDesc(Pageable page);
}
