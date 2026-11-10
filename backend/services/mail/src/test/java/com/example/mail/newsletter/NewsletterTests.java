package com.example.mail.newsletter;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.mail.MailIntegrationTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

class NewsletterTests extends MailIntegrationTest {

    private static final Pattern CONFIRM_LINK = Pattern.compile("https://mail\\.test/subscriptions/confirm\\?token=([A-Za-z0-9_.-]+)");

    @Test
    void takesAReaderFromSubscriptionToUnsubscribing() throws Exception {
        var audience = audience("Engines weekly");

        assertThat(subscribe(audience, "Ada@Example.com", "Ada")).hasStatus(HttpStatus.ACCEPTED);
        var confirmation = awaitMail("ada@example.com");
        assertThat(confirmation.getSubject()).isEqualTo("Confirm your subscription to Engines weekly");
        var token = token(confirmation);

        assertThat(mvc.get().uri("/subscriptions/confirm?token={token}", token).accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .bodyText()
            .contains("Confirm your subscription", "name=\"token\"");
        assertThat(subscribers(audience)).containsExactly("ada@example.com:PENDING");

        assertThat(mvc.post().uri("/subscriptions/confirm").param("token", token).accept(MediaType.TEXT_HTML))
            .hasStatusOk()
            .bodyText()
            .contains("You are subscribed");
        assertThat(subscribers(audience)).containsExactly("ada@example.com:CONFIRMED");

        outgoing.clear();
        assertThat(campaign(audience)).hasStatus(HttpStatus.ACCEPTED).bodyJson().isLenientlyEqualTo("{\"queued\": 1}");
        var issue = awaitMail("ada@example.com");
        assertThat(issue.getSubject()).isEqualTo("Engines are back");
        assertThat(issue.getContent().toString()).contains("Hi Ada,", "Steam, at last.");
        assertThat(issue.getHeader("List-Unsubscribe-Post")).containsExactly("List-Unsubscribe=One-Click");
        var unsubscribe = issue.getHeader("List-Unsubscribe")[0].replaceAll("[<>]", "");

        assertThat(mvc.post().uri(unsubscribe.replace("https://mail.test", "")).param("List-Unsubscribe", "One-Click"))
            .hasStatusOk();
        assertThat(subscribers(audience)).containsExactly("ada@example.com:UNSUBSCRIBED");
        assertThat(campaign(audience)).bodyJson().isLenientlyEqualTo("{\"queued\": 0}");
    }

    @Test
    void asksAgainForConfirmationAfterAnUnsubscribe() throws Exception {
        var audience = audience("Second chances");
        subscribe(audience, "grace@example.com", "Grace");
        var first = token(awaitMail("grace@example.com"));
        mvc.post().uri("/subscriptions/confirm").param("token", first).exchange();
        var unsubscribeLink = mvc.post().uri("/subscriptions/unsubscribe").param("token", "invalid").exchange();
        assertThat(unsubscribeLink).bodyText().contains("This link does not work");

        outgoing.clear();
        assertThat(subscribe(audience, "grace@example.com", "Grace Hopper")).hasStatus(HttpStatus.ACCEPTED);
        assertThat(subscribers(audience)).containsExactly("grace@example.com:CONFIRMED");

        jdbc.sql("UPDATE subscriber SET status = 'UNSUBSCRIBED' WHERE email = 'grace@example.com'").update();
        assertThat(subscribe(audience, "grace@example.com", "Grace Hopper")).hasStatus(HttpStatus.ACCEPTED);
        assertThat(awaitMail("grace@example.com").getContent().toString()).contains("Hi Grace Hopper,");
        assertThat(subscribers(audience)).containsExactly("grace@example.com:PENDING");
    }

    @Test
    void refusesAnInvalidLinkWithoutChangingAnything() {
        assertThat(mvc.post().uri("/subscriptions/unsubscribe").param("token", "forged.token").param("List-Unsubscribe", "One-Click"))
            .hasStatus(HttpStatus.BAD_REQUEST);
        assertThat(mvc.get().uri("/subscriptions/elsewhere?token=x")).hasStatus(HttpStatus.NOT_FOUND);
    }

    @Test
    void answersNotFoundForAnUnknownAudience() {
        assertThat(subscribe(UUID.randomUUID().toString(), "ada@example.com", "Ada")).hasStatus(HttpStatus.NOT_FOUND);
        assertThat(mvc.get().uri("/api/v1/audiences/{id}/subscribers", UUID.randomUUID()).with(admin())).hasStatus(HttpStatus.NOT_FOUND);
    }

    @Test
    void listsTheSubscribersOfAnAudience() {
        var audience = audience("Listed");
        subscribe(audience, "alan@example.com", "Alan");

        assertThat(mvc.get().uri("/api/v1/audiences/{id}/subscribers", audience).with(admin()))
            .hasStatusOk()
            .bodyJson()
            .isLenientlyEqualTo("""
                [{"email": "alan@example.com", "name": "Alan", "status": "PENDING"}]
                """)
            .hasPath("$[0].id")
            .hasPath("$[0].createdAt");
    }

    @Test
    void listsAudiencesByName() {
        audience("Zebra news");
        audience("Aardvark news");

        assertThat(mvc.get().uri("/api/v1/audiences").with(admin()))
            .bodyJson()
            .extractingPath("$[*].name")
            .asArray()
            .containsSubsequence("Aardvark news", "Zebra news");
    }

    @Test
    void refusesAnInvalidSubscription() {
        assertThat(subscribe(audience("Strict"), "not-an-address", ""))
            .hasStatus(HttpStatus.BAD_REQUEST)
            .bodyJson()
            .extractingPath("$.errors")
            .asMap()
            .containsOnlyKeys("email", "name");
    }

    private String audience(String name) {
        try {
            return create(name);
        } catch (java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException(e);
        }
    }

    private String create(String name) throws java.io.UnsupportedEncodingException {
        var result = mvc.post().uri("/api/v1/audiences").with(admin()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"%s\",\"description\":\"For tests\"}".formatted(name)).exchange();
        assertThat(result).hasStatus(HttpStatus.CREATED);
        return com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(StandardCharsets.UTF_8), "$.id");
    }

    private org.springframework.test.web.servlet.assertj.MvcTestResult subscribe(String audience, String email, String name) {
        return mvc.post().uri("/api/v1/audiences/{id}/subscriptions", audience).contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"%s\",\"name\":\"%s\"}".formatted(email, name)).exchange();
    }

    private org.springframework.test.web.servlet.assertj.MvcTestResult campaign(String audience) {
        return mvc.post().uri("/api/v1/audiences/{id}/campaigns", audience).with(admin()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"template\":\"newsletter\",\"values\":{\"headline\":\"Engines are back\",\"body\":\"Steam, at last.\"}}").exchange();
    }

    private List<String> subscribers(String audience) {
        return jdbc.sql("SELECT email, status FROM subscriber WHERE audience_id = UUID_TO_BIN(?) ORDER BY created_at")
            .param(audience).query((row, _) -> row.getString("email") + ":" + row.getString("status")).list();
    }

    private MimeMessage awaitMail(String to) throws Exception {
        org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(20)).until(() -> mailTo(to).isPresent());
        return mailTo(to).orElseThrow();
    }

    private Optional<MimeMessage> mailTo(String to) throws Exception {
        for (var mime : sent().reversed())
            if (mime.getAllRecipients()[0].toString().equals(to)) return Optional.of(mime);
        return Optional.empty();
    }

    private static String token(MimeMessage mime) throws Exception {
        var matcher = CONFIRM_LINK.matcher(org.springframework.web.util.HtmlUtils.htmlUnescape(mime.getContent().toString()));
        assertThat(matcher.find()).isTrue();
        return matcher.group(1);
    }
}
