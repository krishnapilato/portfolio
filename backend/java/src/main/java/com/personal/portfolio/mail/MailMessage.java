package com.personal.portfolio.mail;

import com.personal.portfolio.platform.ApiException;
import com.personal.portfolio.platform.Problem.MailNotModifiable;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "mail_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MailMessage {

    private static final int MAX_ERROR_LENGTH = 1000;
    private static final int MAX_BACKOFF_SHIFT = 30;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Version
    private long version;

    @Convert(converter = AddressListConverter.class)
    private List<String> recipients;

    @Convert(converter = AddressListConverter.class)
    private List<String> cc;

    @Convert(converter = AddressListConverter.class)
    private List<String> bcc;

    private @Nullable String replyTo;

    private String subject;

    @Column(columnDefinition = "longtext")
    private String body;

    private boolean html;

    @Enumerated(EnumType.STRING)
    private MailStatus status;

    private int attempts;

    private Instant scheduledAt;

    private @Nullable Instant sentAt;

    private @Nullable String lastError;

    private @Nullable String requestId;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @Getter(AccessLevel.NONE)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "mail_attachments", joinColumns = @JoinColumn(name = "message_id"))
    @OrderColumn(name = "sort_order")
    private List<Attachment> attachments = new ArrayList<>();

    public static MailMessage compose(Envelope envelope, Instant sendAt, @Nullable String requestId) {
        var message = new MailMessage();
        message.recipients = envelope.to();
        message.cc = envelope.cc();
        message.bcc = envelope.bcc();
        message.replyTo = envelope.replyTo();
        message.subject = envelope.subject();
        message.body = envelope.body();
        message.html = envelope.html();
        message.attachments.addAll(envelope.attachments());
        message.status = MailStatus.PENDING;
        message.scheduledAt = sendAt;
        message.requestId = requestId;
        return message;
    }

    public List<Attachment> getAttachments() {
        return Collections.unmodifiableList(attachments);
    }

    public void markSent(Instant now) {
        status = MailStatus.SENT;
        sentAt = now;
    }

    public void markFailed(String error, Instant now, int maxAttempts, Duration initialBackoff, Duration maxBackoff) {
        attempts++;
        lastError = error.substring(0, Math.min(error.length(), MAX_ERROR_LENGTH));
        if (attempts >= maxAttempts) {
            status = MailStatus.FAILED;
            return;
        }
        var backoff = initialBackoff.multipliedBy(1L << Math.min(attempts - 1, MAX_BACKOFF_SHIFT));
        scheduledAt = now.plus(Comparator.<Duration>naturalOrder().min(backoff, maxBackoff));
    }

    public void retry(Instant now) {
        if (status != MailStatus.FAILED && status != MailStatus.CANCELLED) {
            throw notModifiable();
        }
        status = MailStatus.PENDING;
        attempts = 0;
        scheduledAt = now;
    }

    public void cancel() {
        if (status != MailStatus.PENDING) {
            throw notModifiable();
        }
        status = MailStatus.CANCELLED;
    }

    public Envelope envelope() {
        return new Envelope(recipients, cc, bcc, replyTo, subject, body, html, attachments);
    }

    private ApiException notModifiable() {
        return new ApiException(new MailNotModifiable(id, status));
    }
}
