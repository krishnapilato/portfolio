package com.personal.portfolio.mail;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import org.hibernate.Length;

@Embeddable
@SuppressWarnings("ArrayRecordComponent")
public record Attachment(
        @Column(nullable = false) String filename,
        @Column(name = "content_type", nullable = false) String contentType,
        @Lob @Column(nullable = false, length = Length.LONG32) byte[] content) {

    public int size() {
        return content.length;
    }
}
