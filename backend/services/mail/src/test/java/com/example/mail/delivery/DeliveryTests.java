package com.example.mail.delivery;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.example.mail.MailIntegrationTest;
import jakarta.mail.internet.InternetAddress;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;

class DeliveryTests extends MailIntegrationTest {

    @Test
    void deliversAMessageAndForgetsItsBody() throws Exception {
        var id = send("ada@example.com");

        awaitFinished(id);

        assertThat(status(id)).isEqualTo("SENT");
        var mime = sent().getLast();
        assertThat(mime.getFrom()).containsExactly(new InternetAddress("no-reply@foundation.local", "Foundation"));
        assertThat(mime.getAllRecipients()).containsExactly(new InternetAddress("ada@example.com"));
        assertThat(mime.getSubject()).isEqualTo("Confirm your subscription to Engines");
        assertThat(mime.getContent().toString()).contains("Hi Ada,", "https://mail.test/confirm");
        assertThat(mime.getHeader("List-Unsubscribe")).isNull();
        assertThat(jdbc.sql("SELECT html FROM message WHERE id = UUID_TO_BIN(?)").param(id.toString()).query(String.class).optional())
            .isEmpty();
        assertThat(mvc.get().uri("/api/v1/messages/{id}", id).with(admin()))
            .bodyJson()
            .isLenientlyEqualTo("""
                {"recipient": "ada@example.com", "subject": "Confirm your subscription to Engines", "status": "SENT"}
                """)
            .hasPath("$.finishedAt");
    }

    @Test
    void retriesThenGivesUpOnAMailServerThatKeepsFailing() {
        willThrow(new MailSendException("connection refused")).given(sender).send(anyPreparator());

        var id = send("grace@example.com");
        awaitFinished(id);

        assertThat(status(id)).isEqualTo("FAILED");
        verify(sender, times(3)).send(anyPreparator());
    }

    @Test
    void listsTheLatestMessagesFirst() {
        var first = send("first@example.com");
        var second = send("second@example.com");

        assertThat(mvc.get().uri("/api/v1/messages?size=2").with(admin()))
            .bodyJson()
            .extractingPath("$.content[*].id")
            .asArray()
            .containsExactly(second.toString(), first.toString());
    }

    @Test
    void answersNotFoundForAnUnknownMessage() {
        assertThat(mvc.get().uri("/api/v1/messages/{id}", UUID.randomUUID()).with(admin())).hasStatus(HttpStatus.NOT_FOUND);
    }

    @Test
    void refusesAnInvalidRequest() {
        assertThat(mvc.post().uri("/api/v1/messages").with(admin()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"to\":\"not an address\",\"template\":\"\",\"values\":{}}"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .extractingPath("$.errors")
            .asMap()
            .containsOnlyKeys("to", "template");
    }

    private UUID send(String to) {
        var result = mvc.post().uri("/api/v1/messages").with(admin()).contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"to": "%s", "template": "subscription-confirmation",
                 "values": {"name": "Ada", "audience": "Engines", "confirmUrl": "https://mail.test/confirm"}}
                """.formatted(to))
            .exchange();
        assertThat(result).hasStatus(HttpStatus.ACCEPTED).containsHeader(HttpHeaders.LOCATION);
        return UUID.fromString(Objects.requireNonNull(result.getResponse().getHeader(HttpHeaders.LOCATION)).substring("/api/v1/messages/".length()));
    }
}
