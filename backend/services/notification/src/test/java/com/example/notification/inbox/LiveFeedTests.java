package com.example.notification.inbox;

import module java.base;
import module java.net.http;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;

import com.example.notification.NotificationIntegrationTest;
import jakarta.servlet.AsyncEvent;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockAsyncContext;
import org.springframework.test.web.servlet.MockMvc;

/// Over real HTTP: a browser keeps the stream open while a notification is sent from elsewhere.
class LiveFeedTests extends NotificationIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private LiveFeed feed;

    @Autowired
    private Inbox inbox;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void pushesANotificationToAnOpenStreamTheMomentItIsSent() throws Exception {
        var lines = new LinkedBlockingQueue<String>();
        var client = HttpClient.newHttpClient();
        var stream = client.sendAsync(HttpRequest.newBuilder(URI.create("http://localhost:%d/demo/api/people/grace/stream".formatted(port))).build(),
            HttpResponse.BodyHandlers.ofLines());
        var reading = stream.thenAccept(response -> response.body().forEach(lines::add));
        await().atMost(Duration.ofSeconds(10)).until(() -> feed.openStreams("demo-grace") > 0);

        var sent = inbox.send("demo-grace", "Build finished", "All green.", null);

        await().atMost(Duration.ofSeconds(10)).until(() -> lines.contains("id:" + sent.id()));
        assertThat(lines).contains("event:notification").anySatisfy(line -> assertThat(line).startsWith("data:").contains("Build finished"));
        client.shutdownNow();
        assertThat(client.awaitTermination(Duration.ofSeconds(10))).isTrue();
        await().atMost(Duration.ofSeconds(10)).until(reading::isDone);
    }

    @Test
    void ignoresANotificationForSomeoneWithNoOpenStream() {
        var person = someone();
        var sent = inbox.send(person, "Nobody is watching", "Still kept", null);

        feed.deliver(person, sent.id());

        assertThat(feed.openStreams(person)).isZero();
        assertThat(inbox.latest(person, 1)).containsExactly(sent);
    }

    @Test
    void forgetsAStreamThatCannotBeWrittenTo() {
        var person = someone();
        var emitter = feed.open(person);
        emitter.complete();

        feed.deliver(person, inbox.send(person, "After the end", "Not pushed", null).id());

        assertThat(feed.openStreams(person)).isZero();
    }

    @Test
    void forgetsAStreamOnceItEnds() throws Exception {
        var person = someone();
        var context = openThroughTheApi(person);

        context.complete();

        assertThat(feed.openStreams(person)).isZero();
    }

    @Test
    void forgetsAStreamThatTimesOut() throws Exception {
        var person = someone();
        var context = openThroughTheApi(person);

        for (var listener : context.getListeners()) listener.onTimeout(new AsyncEvent(context));

        assertThat(feed.openStreams(person)).isZero();
    }

    @Test
    void forgetsAStreamThatFails() throws Exception {
        var person = someone();
        var context = openThroughTheApi(person);

        for (var listener : context.getListeners()) listener.onError(new AsyncEvent(context, new IOException("connection reset")));

        assertThat(feed.openStreams(person)).isZero();
    }

    private MockAsyncContext openThroughTheApi(String person) throws Exception {
        var result = mockMvc.perform(get("/api/v1/me/notifications/stream").with(signedInAs(person)).accept(MediaType.TEXT_EVENT_STREAM))
            .andExpect(request().asyncStarted())
            .andReturn();
        assertThat(feed.openStreams(person)).isOne();
        return (MockAsyncContext) Objects.requireNonNull(result.getRequest().getAsyncContext());
    }
}
