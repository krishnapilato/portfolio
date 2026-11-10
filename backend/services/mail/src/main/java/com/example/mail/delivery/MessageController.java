package com.example.mail.delivery;

import module java.base;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Messages", description = "Transactional mail: rendered from a template, stored, then delivered in the background. Administrators only.")
@RestController
@RequestMapping("/api/v1/messages")
@PreAuthorize("hasRole('admin')")
@RequiredArgsConstructor
class MessageController {

    private final Outbox outbox;

    @PostMapping
    ResponseEntity<MessageView> send(@Valid @RequestBody Request request) {
        var message = outbox.queue(request.to(), request.template(), request.values(), null);
        return ResponseEntity.accepted().location(URI.create("/api/v1/messages/" + message.getId())).body(MessageView.of(message));
    }

    @GetMapping
    PagedModel<MessageView> recent(Pageable page) {
        return new PagedModel<>(outbox.recent(page).map(MessageView::of));
    }

    @GetMapping("/{id}")
    MessageView get(@PathVariable UUID id) {
        return MessageView.of(outbox.find(id));
    }

    record Request(@NotBlank @Email @Size(max = 254) String to, @NotBlank String template, @NotNull Map<String, Object> values) {}

    record MessageView(UUID id, String recipient, String subject, Message.Status status, Instant createdAt, @Nullable Instant finishedAt) {

        static MessageView of(Message message) {
            return new MessageView(message.getId(), message.getRecipient(), message.getSubject(), message.getStatus(),
                message.getCreatedAt(), message.getFinishedAt());
        }
    }
}
