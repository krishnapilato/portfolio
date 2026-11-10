package com.example.mail.template;

import module java.base;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageTemplate {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    private String name;
    private String subject;
    private String body;
    private Instant updatedAt;

    MessageTemplate(String name, String subject, String body, Instant now) {
        this.name = name;
        revise(subject, body, now);
    }

    void revise(String subject, String body, Instant now) {
        this.subject = subject;
        this.body = body;
        this.updatedAt = now;
    }
}
