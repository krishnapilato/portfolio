package com.example.mail.newsletter;

import module java.base;

import com.example.mail.delivery.Message;
import com.example.mail.delivery.Outbox;
import com.example.mail.newsletter.SubscriptionLinks.Action;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/// A live tour of the service with people made up by Datafaker. It runs only with the `demo` profile, needs no
/// sign-in, and writes only to addresses on example.com, which can never receive mail.
@Controller
@Profile("demo")
@RequestMapping("/demo")
@RequiredArgsConstructor
class NewsletterDemo {

    static final String AUDIENCE = "Demo readers";

    private final Newsletter newsletter;
    private final SubscriptionLinks links;
    private final Outbox outbox;
    private final Faker faker = new Faker(Locale.ENGLISH);

    @Value("${demo.inbox-url:http://localhost:8025}")
    private String inboxUrl;

    @GetMapping("/")
    String page(Model model) {
        model.addAttribute("inboxUrl", inboxUrl);
        return "demo";
    }

    @GetMapping("/api/state")
    @ResponseBody
    State state() {
        var audience = audience();
        var people = newsletter.subscribers(audience.getId()).stream()
            .map(subscriber -> new Person(subscriber.getId(), subscriber.getName(), subscriber.getEmail(), subscriber.getStatus()))
            .toList();
        var mail = outbox.recent(PageRequest.of(0, 12)).stream()
            .map(message -> new Mail(message.getRecipient(), message.getSubject(), message.getStatus(), message.getFinishedAt()))
            .toList();
        return new State(audience.getName(), people, mail);
    }

    @PostMapping("/api/people")
    @ResponseBody
    State invent(@RequestParam(defaultValue = "3") int count) {
        var audience = audience();
        for (var i = 0; i < Math.clamp(count, 1, 10); i++)
            newsletter.subscribe(audience.getId(), faker.internet().safeEmailAddress(), faker.name().fullName());
        return state();
    }

    @PostMapping("/api/people/{id}/confirm")
    @ResponseBody
    State confirm(@PathVariable UUID id) {
        newsletter.confirm(token(links.link(Action.CONFIRM, id)));
        return state();
    }

    @PostMapping("/api/campaign")
    @ResponseBody
    Campaign campaign() {
        var headline = faker.book().title();
        var queued = newsletter.send(audience().getId(), "newsletter", Map.of("headline", headline, "body", faker.lorem().paragraph(4)));
        return new Campaign(headline, queued);
    }

    private Audience audience() {
        return newsletter.audiences().stream().filter(audience -> audience.getName().equals(AUDIENCE)).findFirst()
            .orElseGet(() -> newsletter.create(AUDIENCE, "People invented by Datafaker for the live demo"));
    }

    private static String token(URI link) {
        return link.getQuery().substring("token=".length());
    }

    record State(String audience, List<Person> people, List<Mail> mail) {}

    record Person(UUID id, String name, String email, Subscriber.Status status) {}

    record Mail(String to, String subject, Message.Status status, @Nullable Instant finishedAt) {}

    record Campaign(String headline, int queued) {}
}
