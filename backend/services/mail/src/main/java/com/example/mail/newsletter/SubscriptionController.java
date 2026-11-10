package com.example.mail.newsletter;

import module java.base;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Subscriptions", description = "Public: anyone can ask to join a list; the address must then be confirmed.")
@RestController
@RequiredArgsConstructor
class SubscriptionController {

    private final Newsletter newsletter;

    @PostMapping("/api/v1/audiences/{id}/subscriptions")
    ResponseEntity<Void> subscribe(@PathVariable UUID id, @Valid @RequestBody Subscription subscription) {
        newsletter.subscribe(id, subscription.email(), subscription.name());
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    record Subscription(@NotBlank @Email @Size(max = 254) String email, @NotBlank @Size(max = 100) String name) {}
}
