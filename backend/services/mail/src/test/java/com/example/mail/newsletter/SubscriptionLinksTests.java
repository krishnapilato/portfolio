package com.example.mail.newsletter;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.mail.MailProperties;
import com.example.mail.newsletter.SubscriptionLinks.Action;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class SubscriptionLinksTests {

    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[32]);
    private static final UUID SUBSCRIBER = UUID.fromString("019a6c1e-1111-7000-8000-000000000042");

    private final SubscriptionLinks links = links(SECRET);

    @Test
    void pointsAtTheServiceAndVerifiesItsOwnLink() {
        var link = links.link(Action.UNSUBSCRIBE, SUBSCRIBER);

        assertThat(link.toString()).startsWith("https://mail.test/subscriptions/unsubscribe?token=");
        assertThat(links.verify(Action.UNSUBSCRIBE, token(link))).contains(SUBSCRIBER);
    }

    @Test
    void refusesALinkMadeForAnotherAction() {
        assertThat(links.verify(Action.CONFIRM, token(links.link(Action.UNSUBSCRIBE, SUBSCRIBER)))).isEmpty();
    }

    @Test
    void refusesALinkSignedWithAnotherSecret() {
        var foreign = links(Base64.getEncoder().encodeToString("another secret of thirty-two bytes".getBytes(StandardCharsets.UTF_8)));

        assertThat(links.verify(Action.CONFIRM, token(foreign.link(Action.CONFIRM, SUBSCRIBER)))).isEmpty();
    }

    @Test
    void refusesALinkPointedAtAnotherSubscriber() {
        var signature = signature(links.link(Action.CONFIRM, SUBSCRIBER));
        var other = Base64.getUrlEncoder().withoutPadding().encodeToString(UUID.randomUUID().toString().getBytes(StandardCharsets.UTF_8));

        assertThat(links.verify(Action.CONFIRM, other + "." + signature)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "no-dot", "a.b.c", "!!!.signature", "bm90LWEtdXVpZA.signature"})
    void refusesAMalformedToken(String token) {
        assertThat(links.verify(Action.CONFIRM, token)).isEmpty();
    }

    @Test
    void refusesATokenWithAValidSignatureForSomethingThatIsNotAnId() {
        var id = Base64.getUrlEncoder().withoutPadding().encodeToString("not-a-uuid".getBytes(StandardCharsets.UTF_8));
        var forged = links.link(Action.CONFIRM, SUBSCRIBER);

        assertThat(links.verify(Action.CONFIRM, id + "." + signature(forged))).isEmpty();
    }

    private static SubscriptionLinks links(String secret) {
        return new SubscriptionLinks(new MailProperties("no-reply@foundation.local", "Foundation", URI.create("https://mail.test"), secret));
    }

    private static String token(URI link) {
        return link.getQuery().substring("token=".length());
    }

    private static String signature(URI link) {
        var token = token(link);
        return token.substring(token.indexOf('.') + 1);
    }
}
