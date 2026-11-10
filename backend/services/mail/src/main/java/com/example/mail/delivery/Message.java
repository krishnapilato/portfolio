package com.example.mail.delivery;

import module java.base;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;
import org.jspecify.annotations.Nullable;

/// The body is kept only until the message leaves: once delivered or given up, no copy of it remains here.
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    private String recipient;
    private String subject;
    private @Nullable String html;
    private @Nullable String unsubscribeUrl;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Instant createdAt;
    private @Nullable Instant finishedAt;

    Message(String recipient, String subject, String html, @Nullable URI unsubscribeUrl, Instant now) {
        this.recipient = recipient;
        this.subject = subject;
        this.html = html;
        this.unsubscribeUrl = unsubscribeUrl == null ? null : unsubscribeUrl.toString();
        this.status = Status.QUEUED;
        this.createdAt = now;
    }

    void delivered(Instant now) {
        finish(Status.SENT, now);
    }

    void failed(Instant now) {
        finish(Status.FAILED, now);
    }

    private void finish(Status outcome, Instant now) {
        this.status = outcome;
        this.finishedAt = now;
        this.html = null;
    }

    public enum Status { QUEUED, SENT, FAILED }
}
