package com.personal.portfolio.system;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.DataWithMediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tools.jackson.databind.json.JsonMapper;

@Slf4j
@Component
class PulseBroadcaster {

    private static final String EVENT = "snapshot";
    private static final Duration SUBSCRIPTION_TIMEOUT = Duration.ofMinutes(30);
    private static final int MAX_SUBSCRIBERS = 100;

    private final Set<SseEmitter> subscribers = ConcurrentHashMap.newKeySet();
    private final SnapshotService snapshots;
    private final JsonMapper mapper;

    PulseBroadcaster(SnapshotService snapshots, JsonMapper mapper, MeterRegistry registry) {
        this.snapshots = snapshots;
        this.mapper = mapper;
        Gauge.builder("portfolio.dashboard.subscribers", subscribers, Set::size)
                .description("Open server-sent event streams of the system dashboard")
                .register(registry);
    }

    public SseEmitter subscribe() {
        if (subscribers.size() >= MAX_SUBSCRIBERS) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        }
        var emitter = new SseEmitter(SUBSCRIPTION_TIMEOUT.toMillis());
        emitter.onCompletion(() -> subscribers.remove(emitter));
        emitter.onTimeout(() -> release(emitter));
        emitter.onError(_ -> subscribers.remove(emitter));
        subscribers.add(emitter);
        return emitter;
    }

    @Scheduled(fixedRateString = "${app.dashboard.pulse-interval}")
    public void broadcast() {
        if (subscribers.isEmpty()) {
            return;
        }
        var event = SseEmitter.event()
                .name(EVENT)
                .data(mapper.writeValueAsString(snapshots.capture()), MediaType.APPLICATION_JSON)
                .build();
        subscribers.forEach(subscriber -> deliver(subscriber, event));
    }

    @EventListener(ContextClosedEvent.class)
    void releaseAll() {
        subscribers.forEach(this::release);
    }

    private void deliver(SseEmitter subscriber, Set<DataWithMediaType> event) {
        try {
            subscriber.send(event);
        } catch (IOException | IllegalStateException e) {
            subscribers.remove(subscriber);
            log.debug("Dropped a dashboard subscriber: {}", e.getMessage());
        }
    }

    private void release(SseEmitter subscriber) {
        subscribers.remove(subscriber);
        subscriber.complete();
    }
}
