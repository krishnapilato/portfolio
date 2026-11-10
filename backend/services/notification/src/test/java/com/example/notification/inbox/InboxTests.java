package com.example.notification.inbox;

import module java.base;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.notification.NotificationIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;

class InboxTests extends NotificationIntegrationTest {

    @Autowired
    private Inbox inbox;

    @Autowired
    private StringRedisTemplate redis;

    @Test
    void keepsTheNewestFirstAndCountsWhatIsUnread() {
        var person = someone();
        var first = inbox.send(person, "First", "One", null);
        var second = inbox.send(person, "Second", "Two", URI.create("https://app.test/orders/7"));

        assertThat(inbox.latest(person, 10)).containsExactly(second, first);
        assertThat(second.link()).isEqualTo(URI.create("https://app.test/orders/7"));
        assertThat(first.link()).isNull();
        assertThat(inbox.unread(person)).isEqualTo(2);
        assertThat(inbox.latest(person, 1)).containsExactly(second);
    }

    @Test
    void marksANotificationRead() {
        var person = someone();
        var notification = inbox.send(person, "Hello", "World", null);

        assertThat(inbox.markRead(person, notification.id())).isTrue();

        assertThat(inbox.find(person, notification.id())).hasValueSatisfying(found -> assertThat(found.read()).isTrue());
        assertThat(inbox.latest(person, 10)).singleElement().satisfies(found -> assertThat(found.read()).isTrue());
        assertThat(inbox.unread(person)).isZero();
    }

    @Test
    void refusesToMarkWhatIsNotInTheInbox() {
        var person = someone();
        var notification = inbox.send(someone(), "For someone else", "Not yours", null);

        assertThat(inbox.markRead(person, notification.id())).isFalse();
        assertThat(inbox.find(person, notification.id())).isEmpty();
        assertThat(redis.hasKey("inbox:" + person + ":read")).isFalse();
    }

    @Test
    void keepsOnlyTheNewestNotifications() {
        var person = someone();
        for (var i = 1; i <= 5; i++) inbox.send(person, "Number " + i, "Body", null);

        assertThat(inbox.latest(person, 10)).extracting(Notification::title).containsExactly("Number 5", "Number 4", "Number 3");
    }

    @Test
    void forgetsAnInboxAfterTheRetentionPeriod() {
        var person = someone();
        var notification = inbox.send(person, "Hello", "World", null);
        inbox.markRead(person, notification.id());

        assertThat(redis.getExpire("inbox:" + person)).isBetween(Duration.ofDays(30).toSeconds() - 60, Duration.ofDays(30).toSeconds());
        assertThat(redis.getExpire("inbox:" + person + ":read")).isPositive();
    }

    @Test
    void neverCountsBelowZero() {
        var person = someone();
        redis.opsForSet().add("inbox:" + person + ":read", "1-0", "2-0");

        assertThat(inbox.unread(person)).isZero();
    }
}
