package com.example.mail.newsletter;

import module java.base;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Audiences", description = "Newsletter lists, their subscribers and campaigns. Administrators only.")
@RestController
@RequestMapping("/api/v1/audiences")
@PreAuthorize("hasRole('admin')")
@RequiredArgsConstructor
class AudienceController {

    private final Newsletter newsletter;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    AudienceView create(@Valid @RequestBody AudienceDraft draft) {
        return AudienceView.of(newsletter.create(draft.name(), draft.description()));
    }

    @GetMapping
    List<AudienceView> list() {
        return newsletter.audiences().stream().map(AudienceView::of).toList();
    }

    @GetMapping("/{id}/subscribers")
    List<SubscriberView> subscribers(@PathVariable UUID id) {
        return newsletter.subscribers(id).stream().map(SubscriberView::of).toList();
    }

    @PostMapping("/{id}/campaigns")
    @ResponseStatus(HttpStatus.ACCEPTED)
    CampaignView send(@PathVariable UUID id, @Valid @RequestBody Campaign campaign) {
        return new CampaignView(newsletter.send(id, campaign.template(), campaign.values()));
    }

    record AudienceDraft(@NotBlank @Size(max = 100) String name, @NotNull @Size(max = 500) String description) {}

    record Campaign(@NotBlank String template, @NotNull Map<String, Object> values) {}

    record AudienceView(UUID id, String name, String description, Instant createdAt) {

        static AudienceView of(Audience audience) {
            return new AudienceView(audience.getId(), audience.getName(), audience.getDescription(), audience.getCreatedAt());
        }
    }

    record SubscriberView(UUID id, String email, String name, Subscriber.Status status, Instant createdAt, @Nullable Instant confirmedAt) {

        static SubscriberView of(Subscriber subscriber) {
            return new SubscriberView(subscriber.getId(), subscriber.getEmail(), subscriber.getName(), subscriber.getStatus(),
                subscriber.getCreatedAt(), subscriber.getConfirmedAt());
        }
    }

    record CampaignView(int queued) {}
}
