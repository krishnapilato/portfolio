package com.personal.portfolio.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.DataWithMediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import tools.jackson.databind.json.JsonMapper;

class PulseBroadcasterTests {

    private static final SystemSnapshot SNAPSHOT = new SystemSnapshot(
            Instant.parse("2026-09-30T08:00:00Z"),
            "UP",
            Map.of("diskSpace", "UP", "db", "UP"),
            new SystemSnapshot.Jvm("27+35", "Oracle Corporation", 3_600, 64L << 20, 512L << 20, 42, 0.125, 8),
            new SystemSnapshot.Traffic(120, 2, 12.5),
            new SystemSnapshot.Domain(3, 3, 1, 5, 0),
            new SystemSnapshot.Build("1.0.0", "abc1234", Instant.parse("2026-09-29T20:00:00Z")));

    private final SnapshotService snapshots = mock(SnapshotService.class);
    private final JsonMapper mapper = JsonMapper.builder().build();
    private final MeterRegistry registry = new SimpleMeterRegistry();
    private final PulseBroadcaster pulse = new PulseBroadcaster(snapshots, mapper, registry);

    @Test
    void capturesNothingWhileNobodyListens() {
        pulse.broadcast();

        verifyNoInteractions(snapshots);
        assertThat(subscribers()).isZero();
    }

    @Test
    void opensHalfHourStreamsAndCountsThem() {
        var timeouts = new CopyOnWriteArrayList<Object>();
        try (var emitters = mockConstruction(SseEmitter.class,
                (_, context) -> timeouts.addAll(context.arguments()))) {
            var first = pulse.subscribe();
            var second = pulse.subscribe();

            assertThat(emitters.constructed()).containsExactly(first, second);
            assertThat(timeouts).containsOnly(Duration.ofMinutes(30).toMillis()).hasSize(2);
            assertThat(subscribers()).isEqualTo(2);
        }
    }

    @Test
    void refusesStreamsBeyondTheSubscriberCapUntilOneCloses() {
        try (var _ = mockConstruction(SseEmitter.class)) {
            var streams = IntStream.range(0, 100).mapToObj(_ -> pulse.subscribe()).toList();

            assertThat(subscribers()).isEqualTo(100);
            assertThatThrownBy(pulse::subscribe).isInstanceOfSatisfying(ResponseStatusException.class,
                    refused -> assertThat(refused.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
            assertThat(subscribers()).isEqualTo(100);

            ArgumentCaptor<Runnable> completion = ArgumentCaptor.captor();
            verify(streams.getFirst()).onCompletion(completion.capture());
            completion.getValue().run();

            assertThat(pulse.subscribe()).isNotNull();
            assertThat(subscribers()).isEqualTo(100);
        }
    }

    @Test
    void sendsOneSharedSnapshotEventToEverySubscriber() throws IOException {
        given(snapshots.capture()).willReturn(SNAPSHOT);
        try (var _ = mockConstruction(SseEmitter.class)) {
            var first = pulse.subscribe();
            var second = pulse.subscribe();

            pulse.broadcast();

            ArgumentCaptor<Set<DataWithMediaType>> delivered = ArgumentCaptor.captor();
            verify(first).send(delivered.capture());
            verify(second).send(delivered.capture());
            assertThat(delivered.getAllValues().getLast()).isSameAs(delivered.getAllValues().getFirst());
            var event = delivered.getValue();
            assertThat(event)
                    .extracting(DataWithMediaType::getData, DataWithMediaType::getMediaType)
                    .contains(tuple(mapper.writeValueAsString(SNAPSHOT), MediaType.APPLICATION_JSON));
            assertThat(event.stream().map(item -> String.valueOf(item.getData())).collect(Collectors.joining()))
                    .startsWith("event:snapshot\ndata:")
                    .endsWith("\n\n");
        }
        verify(snapshots, times(1)).capture();
    }

    @Test
    void serializesTheSnapshotContractAsJson() throws IOException {
        given(snapshots.capture()).willReturn(SNAPSHOT);
        try (var _ = mockConstruction(SseEmitter.class)) {
            var subscriber = pulse.subscribe();

            pulse.broadcast();

            ArgumentCaptor<Set<DataWithMediaType>> delivered = ArgumentCaptor.captor();
            verify(subscriber).send(delivered.capture());
            var json = delivered.getValue().stream()
                    .filter(item -> MediaType.APPLICATION_JSON.equals(item.getMediaType()))
                    .map(item -> mapper.readTree(String.valueOf(item.getData())))
                    .findFirst()
                    .orElseThrow();
            assertThat(json.path("status").asString()).isEqualTo("UP");
            assertThat(json.path("capturedAt").asString()).isEqualTo("2026-09-30T08:00:00Z");
            assertThat(json.path("components").propertyNames()).containsExactly("db", "diskSpace");
            assertThat(json.path("runtime").path("java").asString()).isEqualTo("27+35");
            assertThat(json.path("runtime").path("cpu").asDouble()).isEqualTo(0.125);
            assertThat(json.path("traffic").path("meanLatencyMs").asDouble()).isEqualTo(12.5);
            assertThat(json.path("domain").path("mailSent").asLong()).isEqualTo(5);
            assertThat(json.path("build").path("commit").asString()).isEqualTo("abc1234");
        }
    }

    @Test
    void dropsSubscribersThatCanNoLongerBeReached() throws IOException {
        given(snapshots.capture()).willReturn(SNAPSHOT);
        try (var _ = mockConstruction(SseEmitter.class, (emitter, context) -> {
            switch (context.getCount()) {
                case 2 -> willThrow(new IOException("Broken pipe")).given(emitter).send(anySet());
                case 3 -> willThrow(new IllegalStateException("ResponseBodyEmitter has already completed"))
                        .given(emitter).send(anySet());
                default -> { }
            }
        })) {
            var healthy = pulse.subscribe();
            var broken = pulse.subscribe();
            var completed = pulse.subscribe();

            pulse.broadcast();
            pulse.broadcast();

            verify(healthy, times(2)).send(anySet());
            verify(broken, times(1)).send(anySet());
            verify(completed, times(1)).send(anySet());
            assertThat(subscribers()).isEqualTo(1);
        }
    }

    @Test
    void forgetsSubscribersWhoseStreamCompleted() {
        try (var _ = mockConstruction(SseEmitter.class)) {
            var subscriber = pulse.subscribe();
            ArgumentCaptor<Runnable> completion = ArgumentCaptor.captor();
            verify(subscriber).onCompletion(completion.capture());

            completion.getValue().run();

            assertThat(subscribers()).isZero();
            verify(subscriber, never()).complete();
        }
    }

    @Test
    void forgetsSubscribersWhoseStreamFailed() {
        try (var _ = mockConstruction(SseEmitter.class)) {
            var subscriber = pulse.subscribe();
            ArgumentCaptor<Consumer<Throwable>> failure = ArgumentCaptor.captor();
            verify(subscriber).onError(failure.capture());

            failure.getValue().accept(new IOException("Connection reset"));

            assertThat(subscribers()).isZero();
        }
    }

    @Test
    void completesAndForgetsSubscribersThatTimedOut() {
        try (var _ = mockConstruction(SseEmitter.class)) {
            var subscriber = pulse.subscribe();
            ArgumentCaptor<Runnable> timeout = ArgumentCaptor.captor();
            verify(subscriber).onTimeout(timeout.capture());

            timeout.getValue().run();

            assertThat(subscribers()).isZero();
            verify(subscriber).complete();
        }
    }

    @Test
    void completesEveryStreamWhenTheApplicationStops() {
        try (var emitters = mockConstruction(SseEmitter.class)) {
            pulse.subscribe();
            pulse.subscribe();

            pulse.releaseAll();

            assertThat(subscribers()).isZero();
            List<SseEmitter> constructed = emitters.constructed();
            constructed.forEach(emitter -> verify(emitter).complete());
        }
    }

    private double subscribers() {
        return registry.get("portfolio.dashboard.subscribers").gauge().value();
    }
}
