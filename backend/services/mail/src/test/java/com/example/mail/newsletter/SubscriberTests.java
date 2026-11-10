package com.example.mail.newsletter;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SubscriberTests {

    private static final Instant NOW = Instant.parse("2026-11-10T09:00:00Z");

    private final Subscriber subscriber = new Subscriber(UUID.randomUUID(), "ada@example.com", "Ada", NOW);

    @Test
    void startsPending() {
        assertThat(subscriber.getStatus()).isEqualTo(Subscriber.Status.PENDING);
        assertThat(subscriber.getCreatedAt()).isEqualTo(NOW);
        assertThat(subscriber.getConfirmedAt()).isNull();
    }

    @Test
    void confirmsOnlyAPendingSubscription() {
        subscriber.confirm(NOW.plusSeconds(5));
        subscriber.confirm(NOW.plusSeconds(9));

        assertThat(subscriber.getStatus()).isEqualTo(Subscriber.Status.CONFIRMED);
        assertThat(subscriber.getConfirmedAt()).isEqualTo(NOW.plusSeconds(5));
    }

    @Test
    void neverConfirmsAnUnsubscribedAddressWithAnOldLink() {
        subscriber.unsubscribe();
        subscriber.confirm(NOW.plusSeconds(5));

        assertThat(subscriber.getStatus()).isEqualTo(Subscriber.Status.UNSUBSCRIBED);
        assertThat(subscriber.getConfirmedAt()).isNull();
    }

    @Test
    void startsOverWhenAskedAgainAfterUnsubscribing() {
        subscriber.confirm(NOW);
        subscriber.unsubscribe();

        assertThat(subscriber.ask("Ada Lovelace")).isTrue();
        assertThat(subscriber.getStatus()).isEqualTo(Subscriber.Status.PENDING);
        assertThat(subscriber.getName()).isEqualTo("Ada Lovelace");
        assertThat(subscriber.getConfirmedAt()).isNull();
    }

    @Test
    void leavesAConfirmedSubscriptionAlone() {
        subscriber.confirm(NOW);

        assertThat(subscriber.ask("Someone else")).isFalse();
        assertThat(subscriber.getName()).isEqualTo("Ada");
        assertThat(subscriber.getStatus()).isEqualTo(Subscriber.Status.CONFIRMED);
    }
}
