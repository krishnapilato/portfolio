package com.example.notification.inbox;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.notification.NotificationIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class NotificationDemoTests extends NotificationIntegrationTest {

    @Test
    void servesTheDemoPageWithoutSigningIn() {
        assertThat(mvc.get().uri("/demo/").accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .bodyText()
            .contains("Notifications, the moment they happen", "src=\"/demo/demo.js\"");
    }

    @Test
    void introducesThreeMadeUpPeople() {
        assertThat(mvc.get().uri("/demo/api/people"))
            .bodyJson()
            .extractingPath("$[*].id")
            .asArray()
            .containsExactly("ada", "grace", "alan");
        assertThat(mvc.get().uri("/demo/api/people"))
            .bodyJson()
            .extractingPath("$[0].name")
            .asString()
            .isNotBlank();
    }

    @Test
    void notifiesAPersonAndMarksItRead() throws Exception {
        var sent = mvc.post().uri("/demo/api/people/alan/notify").exchange();
        assertThat(sent).hasStatusOk().bodyJson().extractingPath("$.title").asString().endsWith(" needs you");
        String id = com.jayway.jsonpath.JsonPath.read(sent.getResponse().getContentAsString(), "$.id");

        assertThat(mvc.get().uri("/demo/api/people/alan")).bodyJson().extractingPath("$[0].id").isEqualTo(id);
        assertThat(mvc.post().uri("/demo/api/people/alan/read/{id}", id))
            .bodyJson()
            .extractingPath("$[0].read")
            .isEqualTo(true);
    }

    @Test
    void knowsOnlyItsOwnPeople() {
        assertThat(mvc.post().uri("/demo/api/people/mallory/notify")).hasStatus(HttpStatus.NOT_FOUND);
    }
}
