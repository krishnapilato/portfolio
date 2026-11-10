package com.example.notification.inbox;

import module java.base;

import org.jspecify.annotations.Nullable;

public record Notification(String id, String title, String body, @Nullable URI link, Instant createdAt, boolean read) {

    static final String TITLE_FIELD = "title";
    static final String BODY_FIELD = "body";
    static final String LINK_FIELD = "link";
    static final String CREATED_AT_FIELD = "createdAt";

    static Notification of(String id, Map<?, ?> fields, boolean read) {
        var link = (String) fields.get(LINK_FIELD);
        return new Notification(id, (String) fields.get(TITLE_FIELD), (String) fields.get(BODY_FIELD),
            link.isEmpty() ? null : URI.create(link), Instant.parse((String) fields.get(CREATED_AT_FIELD)), read);
    }

    Map<String, String> fields() {
        return Map.of(TITLE_FIELD, title, BODY_FIELD, body, LINK_FIELD, link == null ? "" : link.toString(), CREATED_AT_FIELD, createdAt.toString());
    }
}
