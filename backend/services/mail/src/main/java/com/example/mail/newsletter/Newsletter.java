package com.example.mail.newsletter;

import module java.base;

import com.example.core.problem.ApiException;
import com.example.core.problem.NotFound;
import com.example.mail.delivery.Outbox;
import com.example.mail.newsletter.SubscriptionLinks.Action;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Newsletter {

    static final String CONFIRMATION_TEMPLATE = "subscription-confirmation";

    private final AudienceRepository audiences;
    private final SubscriberRepository subscribers;
    private final SubscriptionLinks links;
    private final Outbox outbox;
    private final Clock clock;

    @Transactional
    public Audience create(String name, String description) {
        return audiences.save(new Audience(name, description, clock.instant()));
    }

    @Transactional(readOnly = true)
    public List<Audience> audiences() {
        return audiences.findAllByOrderByName();
    }

    @Transactional(readOnly = true)
    public List<Subscriber> subscribers(UUID audienceId) {
        return subscribers.findAllByAudienceIdOrderByCreatedAt(audience(audienceId).getId());
    }

    /// Answers the same way whether or not the address is already on the list, so the list stays private.
    @Transactional
    public void subscribe(UUID audienceId, String email, String name) {
        var audience = audience(audienceId);
        var address = email.strip().toLowerCase(Locale.ROOT);
        var existing = subscribers.findByAudienceIdAndEmail(audience.getId(), address);
        var subscriber = existing.orElseGet(() -> new Subscriber(audience.getId(), address, name.strip(), clock.instant()));
        if (existing.isPresent() && !subscriber.ask(name.strip())) return;
        subscribers.save(subscriber);
        outbox.queue(address, CONFIRMATION_TEMPLATE,
            Map.of("name", subscriber.getName(), "audience", audience.getName(), "confirmUrl", links.link(Action.CONFIRM, subscriber.getId())),
            null);
    }

    @Transactional
    public boolean confirm(String token) {
        return act(Action.CONFIRM, token, subscriber -> subscriber.confirm(clock.instant()));
    }

    @Transactional
    public boolean unsubscribe(String token) {
        return act(Action.UNSUBSCRIBE, token, Subscriber::unsubscribe);
    }

    /// Every confirmed subscriber gets the template filled with `values`, their name and their own unsubscribe link.
    @Transactional
    public int send(UUID audienceId, String template, Map<String, ?> values) {
        var recipients = subscribers.findAllByAudienceIdAndStatus(audience(audienceId).getId(), Subscriber.Status.CONFIRMED);
        for (var subscriber : recipients) {
            var unsubscribe = links.link(Action.UNSUBSCRIBE, subscriber.getId());
            var personal = new HashMap<String, Object>(values);
            personal.put("name", subscriber.getName());
            personal.put("unsubscribeUrl", unsubscribe);
            outbox.queue(subscriber.getEmail(), template, personal, unsubscribe);
        }
        return recipients.size();
    }

    private boolean act(Action action, String token, Consumer<Subscriber> change) {
        var subscriber = links.verify(action, token).flatMap(subscribers::findById);
        subscriber.ifPresent(change.andThen(subscribers::save));
        return subscriber.isPresent();
    }

    private Audience audience(UUID id) {
        return audiences.findById(id).orElseThrow(() -> new ApiException(new NotFound("Audience", id)));
    }
}
