package com.example.notification.inbox;

import module java.base;

import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/// A live tour with three people made up by Datafaker. It runs only with the `demo` profile and needs no sign-in:
/// each person's inbox lives under a demo prefix, apart from real ones.
@Controller
@Profile("demo")
@RequestMapping("/demo")
@RequiredArgsConstructor
class NotificationDemo {

    private static final String PREFIX = "demo-";

    private final Inbox inbox;
    private final LiveFeed feed;
    private final Faker faker = new Faker(Locale.ENGLISH, new Random(27));
    private final List<Person> people = List.of(person("ada"), person("grace"), person("alan"));

    @GetMapping("/")
    String page() {
        return "demo";
    }

    @GetMapping("/api/people")
    @ResponseBody
    List<Person> people() {
        return people;
    }

    @GetMapping("/api/people/{id}")
    @ResponseBody
    List<Notification> inbox(@PathVariable String id) {
        return inbox.latest(PREFIX + known(id), 20);
    }

    @PostMapping("/api/people/{id}/notify")
    @ResponseBody
    synchronized Notification notify(@PathVariable String id) {
        return inbox.send(PREFIX + known(id), faker.app().name() + " needs you", "Time to " + faker.hacker().verb() + " the " + faker.hacker().adjective() + " " + faker.hacker().noun() + ".", null);
    }

    @PostMapping("/api/people/{id}/read/{notification}")
    @ResponseBody
    List<Notification> read(@PathVariable String id, @PathVariable String notification) {
        inbox.markRead(PREFIX + known(id), notification);
        return inbox(id);
    }

    @GetMapping(path = "/api/people/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter stream(@PathVariable String id) {
        return feed.open(PREFIX + known(id));
    }

    private String known(String id) {
        return people.stream().map(Person::id).filter(id::equals).findFirst()
            .orElseThrow(() -> new com.example.core.problem.ApiException(new com.example.core.problem.NotFound("Person", id)));
    }

    private Person person(String id) {
        return new Person(id, faker.name().fullName(), faker.job().title());
    }

    record Person(String id, String name, String role) {}
}
