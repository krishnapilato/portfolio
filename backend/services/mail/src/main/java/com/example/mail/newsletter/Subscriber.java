package com.example.mail.newsletter;

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

/// Nobody receives a newsletter without confirming the address first, and unsubscribing always works.
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Subscriber {

    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    private UUID audienceId;
    private String email;
    private String name;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Instant createdAt;
    private @Nullable Instant confirmedAt;

    Subscriber(UUID audienceId, String email, String name, Instant now) {
        this.audienceId = audienceId;
        this.email = email;
        this.name = name;
        this.status = Status.PENDING;
        this.createdAt = now;
    }

    /// Asking again after unsubscribing starts over: the address has to be confirmed again.
    boolean ask(String newName) {
        if (status == Status.CONFIRMED) return false;
        this.name = newName;
        this.status = Status.PENDING;
        this.confirmedAt = null;
        return true;
    }

    void confirm(Instant now) {
        if (status != Status.PENDING) return;
        this.status = Status.CONFIRMED;
        this.confirmedAt = now;
    }

    void unsubscribe() {
        this.status = Status.UNSUBSCRIBED;
    }

    public enum Status { PENDING, CONFIRMED, UNSUBSCRIBED }
}
