package com.example.notification.inbox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;

import com.example.notification.NotificationIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class NotificationApiTests extends NotificationIntegrationTest {

    @Autowired
    private Inbox inbox;

    @Autowired
    private LiveFeed feed;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void letsAnAdministratorNotifySomeone() {
        var person = someone();

        assertThat(mvc.post().uri("/api/v1/notifications").with(signedInAs("operator", "admin")).contentType(MediaType.APPLICATION_JSON)
            .content("{\"recipient\":\"%s\",\"title\":\"Order shipped\",\"body\":\"It is on its way.\",\"link\":\"https://app.test/o/1\"}".formatted(person)))
            .hasStatus(HttpStatus.ACCEPTED)
            .bodyJson()
            .isLenientlyEqualTo("""
                {"title": "Order shipped", "body": "It is on its way.", "link": "https://app.test/o/1", "read": false}
                """);
        assertThat(inbox.latest(person, 10)).extracting(Notification::title).containsExactly("Order shipped");
    }

    @Test
    void keepsSendingForAdministrators() {
        assertThat(mvc.post().uri("/api/v1/notifications").with(signedInAs("someone", "user")).contentType(MediaType.APPLICATION_JSON)
            .content("{\"recipient\":\"x\",\"title\":\"t\",\"body\":\"b\"}"))
            .hasStatus(HttpStatus.FORBIDDEN);
    }

    @Test
    void refusesAnIncompleteNotification() {
        assertThat(mvc.post().uri("/api/v1/notifications").with(signedInAs("operator", "admin")).contentType(MediaType.APPLICATION_JSON)
            .content("{\"recipient\":\"\",\"title\":\"\",\"body\":\"\"}"))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .extractingPath("$.errors")
            .asMap()
            .containsOnlyKeys("recipient", "title", "body");
    }

    @Test
    void showsPeopleOnlyTheirOwnInbox() {
        var me = someone();
        inbox.send(me, "Mine", "For me", null);
        inbox.send(someone(), "Theirs", "Not for me", null);

        assertThat(mvc.get().uri("/api/v1/me/notifications").with(signedInAs(me)))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("{\"unread\": 1}")
            .extractingPath("$.notifications[*].title")
            .asArray()
            .containsExactly("Mine");
        assertThat(mvc.get().uri("/api/v1/me/notifications")).hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void marksOwnNotificationsRead() {
        var me = someone();
        var mine = inbox.send(me, "Mine", "For me", null);
        var theirs = inbox.send(someone(), "Theirs", "Not for me", null);

        assertThat(mvc.post().uri("/api/v1/me/notifications/{id}/read", mine.id()).with(signedInAs(me))).hasStatus(HttpStatus.NO_CONTENT);
        assertThat(mvc.post().uri("/api/v1/me/notifications/{id}/read", theirs.id()).with(signedInAs(me)))
            .hasStatus(HttpStatus.NOT_FOUND);
        assertThat(mvc.post().uri("/api/v1/me/notifications/{id}/read", "not-an-id").with(signedInAs(me)))
            .hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(inbox.unread(me)).isZero();
    }

    @Test
    void opensALiveStreamForTheSignedInPerson() throws Exception {
        var person = someone();

        mockMvc.perform(get("/api/v1/me/notifications/stream").with(signedInAs(person)).accept(MediaType.TEXT_EVENT_STREAM))
            .andExpect(request().asyncStarted());

        assertThat(feed.openStreams(person)).isOne();
    }

    @Test
    void refusesAnUnreasonablePageSize() {
        assertThat(mvc.get().uri("/api/v1/me/notifications?count=0").with(signedInAs(someone()))).hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(mvc.get().uri("/api/v1/me/notifications?count=201").with(signedInAs(someone()))).hasStatus(HttpStatus.BAD_REQUEST);
    }
}
