package com.example.mail.delivery;

import module java.base;

import com.example.core.problem.ApiException;
import com.example.core.problem.NotFound;
import com.example.mail.template.Templates;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/// A message is rendered and stored in the caller's transaction, and goes out only after that transaction commits.
/// Spring Modulith records the event in the same transaction, so a crash in between delays the message but never
/// loses it.
@Service
@RequiredArgsConstructor
public class Outbox {

    private final MessageRepository messages;
    private final Templates templates;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    @Transactional
    public Message queue(String recipient, String template, Map<String, ?> values, @Nullable URI unsubscribeUrl) {
        var rendered = templates.render(template, values);
        var message = messages.save(new Message(recipient, rendered.subject(), rendered.html(), unsubscribeUrl, clock.instant()));
        events.publishEvent(new MessageQueued(message.getId()));
        return message;
    }

    @Transactional(readOnly = true)
    public Page<Message> recent(Pageable page) {
        return messages.findAllByOrderByCreatedAtDesc(page);
    }

    @Transactional(readOnly = true)
    public Message find(UUID id) {
        return messages.findById(id).orElseThrow(() -> new ApiException(new NotFound("Message", id)));
    }

    public record MessageQueued(UUID id) {}
}
