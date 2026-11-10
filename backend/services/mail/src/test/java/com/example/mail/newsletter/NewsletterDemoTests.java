package com.example.mail.newsletter;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.mail.MailIntegrationTest;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

class NewsletterDemoTests extends MailIntegrationTest {

    @Autowired
    private Newsletter newsletter;

    // The demo finds its audience by name: every test starts without one, and with a list it must not pick instead.
    @BeforeEach
    void startWithoutADemoAudience() {
        jdbc.sql("DELETE FROM audience WHERE name = ?").param(NewsletterDemo.AUDIENCE).update();
        if (newsletter.audiences().stream().noneMatch(audience -> audience.getName().equals("A list that comes first")))
            newsletter.create("A list that comes first", "Sorted before the demo audience");
    }

    @Test
    void servesTheDemoPageWithoutSigningIn() {
        assertThat(mvc.get().uri("/demo/").accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .bodyText()
            .contains("Newsletter, end to end", "src=\"/demo/demo.js\"", "href=\"http://localhost:8025\"");
    }

    @Test
    void createsItsOwnAudienceOnFirstUse() {
        assertThat(mvc.get().uri("/demo/api/state"))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("{\"audience\": \"Demo readers\", \"people\": []}");
    }

    @Test
    void invitesBetweenOneAndTenMadeUpReaders() {
        assertThat(mvc.post().uri("/demo/api/people?count=50"))
            .bodyJson()
            .extractingPath("$.people[*].email")
            .asArray()
            .hasSize(10)
            .allSatisfy(email -> assertThat(email.toString()).matches("[^@]+@example\\.(com|org|net)"));
        assertThat(mvc.post().uri("/demo/api/people?count=0")).bodyJson().extractingPath("$.people").asArray().hasSize(11);
        assertThat(mvc.post().uri("/demo/api/people?count=1")).bodyJson().extractingPath("$.people").asArray().hasSize(12);
    }

    @Test
    void confirmsAReaderAndWritesOnlyToConfirmedOnes() throws Exception {
        var invited = mvc.post().uri("/demo/api/people?count=2").exchange().getResponse().getContentAsString();
        String first = JsonPath.read(invited, "$.people[0].id");

        assertThat(mvc.post().uri("/demo/api/people/{id}/confirm", first))
            .bodyJson()
            .extractingPath("$.people[*].status")
            .asArray()
            .containsExactly("CONFIRMED", "PENDING");
        assertThat(mvc.post().uri("/demo/api/campaign"))
            .hasStatusOk()
            .bodyJson()
            .hasPath("$.headline")
            .extractingPath("$.queued")
            .asNumber()
            .isEqualTo(1);
        assertThat(mvc.get().uri("/demo/api/state"))
            .bodyJson()
            .extractingPath("$.mail[0]")
            .asMap()
            .containsKeys("to", "subject", "status")
            .extractingByKey("subject")
            .isNotNull();
    }
}
