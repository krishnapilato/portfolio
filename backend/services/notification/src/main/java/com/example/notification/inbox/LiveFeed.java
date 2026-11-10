package com.example.notification.inbox;

import module java.base;
import static java.nio.charset.StandardCharsets.UTF_8;

import com.example.notification.NotificationProperties;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/// Open server-sent event streams on this instance, by recipient. A notification announced on Redis reaches every
/// stream its recipient has open here; instances without one ignore it. A stream leaves as soon as it ends, times
/// out, fails, or cannot be written to.
@Component
@RequiredArgsConstructor
public class LiveFeed implements MessageListener {

    private final Map<String, Set<SseEmitter>> streams = new ConcurrentHashMap<>();
    private final Inbox inbox;
    private final NotificationProperties properties;

    public SseEmitter open(String recipient) {
        var emitter = new SseEmitter(properties.streamTimeout().toMillis());
        var open = streams.computeIfAbsent(recipient, _ -> ConcurrentHashMap.newKeySet());
        open.add(emitter);
        emitter.onCompletion(() -> open.remove(emitter));
        emitter.onTimeout(() -> open.remove(emitter));
        emitter.onError(_ -> open.remove(emitter));
        return emitter;
    }

    @Override
    public void onMessage(Message message, byte @Nullable [] pattern) {
        deliver(new String(message.getChannel(), UTF_8).substring(Inbox.CHANNEL_PREFIX.length()), new String(message.getBody(), UTF_8));
    }

    int openStreams(String recipient) {
        return streams.getOrDefault(recipient, Set.of()).size();
    }

    void deliver(String recipient, String id) {
        var open = streams.getOrDefault(recipient, Set.of());
        if (open.isEmpty()) return;
        inbox.find(recipient, id).ifPresent(notification -> open.forEach(emitter -> push(open, emitter, notification)));
    }

    private static void push(Set<SseEmitter> open, SseEmitter emitter, Notification notification) {
        try {
            emitter.send(SseEmitter.event().id(notification.id()).name("notification").data(notification));
        } catch (IOException | IllegalStateException _) {
            open.remove(emitter);
        }
    }
}
