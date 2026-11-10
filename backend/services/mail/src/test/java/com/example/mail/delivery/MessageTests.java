package com.example.mail.delivery;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MessageTests {

    private static final Instant NOW = Instant.parse("2026-11-10T09:00:00Z");

    @Test
    void startsQueuedWithItsBody() {
        var message = new Message("ada@example.com", "Subject", "<p>Body</p>", URI.create("https://mail.test/u"), NOW);

        assertThat(message.getStatus()).isEqualTo(Message.Status.QUEUED);
        assertThat(message.getHtml()).isEqualTo("<p>Body</p>");
        assertThat(message.getUnsubscribeUrl()).isEqualTo("https://mail.test/u");
        assertThat(message.getCreatedAt()).isEqualTo(NOW);
        assertThat(message.getFinishedAt()).isNull();
    }

    @Test
    void forgetsTheBodyOnceDeliveredOrGivenUp() {
        var delivered = new Message("ada@example.com", "Subject", "<p>Body</p>", null, NOW);
        var failed = new Message("ada@example.com", "Subject", "<p>Body</p>", null, NOW);

        delivered.delivered(NOW.plusSeconds(1));
        failed.failed(NOW.plusSeconds(2));

        assertThat(delivered.getStatus()).isEqualTo(Message.Status.SENT);
        assertThat(delivered.getFinishedAt()).isEqualTo(NOW.plusSeconds(1));
        assertThat(delivered.getHtml()).isNull();
        assertThat(delivered.getUnsubscribeUrl()).isNull();
        assertThat(failed.getStatus()).isEqualTo(Message.Status.FAILED);
        assertThat(failed.getFinishedAt()).isEqualTo(NOW.plusSeconds(2));
        assertThat(failed.getHtml()).isNull();
    }
}
