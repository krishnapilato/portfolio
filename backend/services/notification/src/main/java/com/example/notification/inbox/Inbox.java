package com.example.notification.inbox;

import module java.base;

import com.example.notification.NotificationProperties;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.Limit;
import org.springframework.data.redis.connection.RedisStreamCommands.XAddOptions;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/// Each person's notifications are a Redis stream: appended in order, trimmed to a fixed size, and gone once the
/// retention period passes without a new one. What was read is a set next to it. Nothing goes to a database.
/// Every new notification is also announced on a channel, so whichever instance holds the person's live
/// connection can push it straight away.
@Service
@RequiredArgsConstructor
public class Inbox {

    static final String CHANNEL_PREFIX = "inbox-live:";

    private final StringRedisTemplate redis;
    private final NotificationProperties properties;
    private final Clock clock;

    public Notification send(String recipient, String title, String body, @Nullable URI link) {
        var draft = new Notification("", title, body, link, clock.instant(), false);
        var options = XAddOptions.maxlen(properties.inboxSize());
        var id = Objects.requireNonNull(redis.opsForStream().add(StreamRecords.string(draft.fields()).withStreamKey(stream(recipient)), options));
        redis.expire(stream(recipient), properties.retention());
        redis.expire(read(recipient), properties.retention());
        redis.convertAndSend(CHANNEL_PREFIX + recipient, id.getValue());
        return new Notification(id.getValue(), title, body, link, draft.createdAt(), false);
    }

    public List<Notification> latest(String recipient, int count) {
        var read = Objects.requireNonNull(redis.opsForSet().members(read(recipient)));
        var records = redis.opsForStream().reverseRange(stream(recipient), Range.unbounded(), Limit.limit().count(count));
        return Objects.requireNonNull(records).stream()
            .map(entry -> Notification.of(entry.getId().getValue(), entry.getValue(), read.contains(entry.getId().getValue())))
            .toList();
    }

    public Optional<Notification> find(String recipient, String id) {
        var record = RecordId.of(id);
        var records = redis.opsForStream().range(stream(recipient), Range.closed(record.getValue(), record.getValue()));
        return Objects.requireNonNull(records).stream().findFirst()
            .map(entry -> Notification.of(id, entry.getValue(), Boolean.TRUE.equals(redis.opsForSet().isMember(read(recipient), id))));
    }

    public long unread(String recipient) {
        var total = Objects.requireNonNull(redis.opsForStream().size(stream(recipient)));
        return Math.max(0, total - Objects.requireNonNull(redis.opsForSet().size(read(recipient))));
    }

    public boolean markRead(String recipient, String id) {
        if (find(recipient, id).isEmpty()) return false;
        redis.opsForSet().add(read(recipient), id);
        redis.expire(read(recipient), properties.retention());
        return true;
    }

    private static String stream(String recipient) {
        return "inbox:" + recipient;
    }

    private static String read(String recipient) {
        return "inbox:" + recipient + ":read";
    }
}
