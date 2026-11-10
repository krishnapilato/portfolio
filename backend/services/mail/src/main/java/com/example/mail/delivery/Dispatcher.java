package com.example.mail.delivery;

import module java.base;

import com.example.mail.delivery.Outbox.MessageQueued;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
class Dispatcher {

    private final MessageRepository messages;
    private final Courier courier;
    private final Clock clock;

    @ApplicationModuleListener
    void on(MessageQueued event) {
        messages.findById(event.id()).filter(message -> message.getStatus() == Message.Status.QUEUED).ifPresent(message -> {
            try {
                courier.deliver(message);
                message.delivered(clock.instant());
            } catch (MailException e) {
                log.atWarn().addKeyValue("messageId", message.getId()).addKeyValue("exceptionType", e.getClass().getName())
                    .log("Giving up on a message");
                message.failed(clock.instant());
            }
            messages.save(message);
        });
    }
}
