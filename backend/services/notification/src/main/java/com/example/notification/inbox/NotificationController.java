package com.example.notification.inbox;

import module java.base;

import com.example.core.problem.ApiException;
import com.example.core.problem.NotFound;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/// A person is the subject of their Keycloak token: everyone reads only their own inbox.
@Tag(name = "Notifications", description = "Sending is for administrators; reading is for the person the notifications are for.")
@RestController
@RequiredArgsConstructor
class NotificationController {

    private final Inbox inbox;
    private final LiveFeed feed;

    @PostMapping("/api/v1/notifications")
    @PreAuthorize("hasRole('admin')")
    @ResponseStatus(HttpStatus.ACCEPTED)
    Notification send(@Valid @RequestBody Draft draft) {
        return inbox.send(draft.recipient(), draft.title(), draft.body(), draft.link());
    }

    @GetMapping("/api/v1/me/notifications")
    Page latest(@AuthenticationPrincipal Jwt me, @RequestParam(defaultValue = "50") @Min(1) @Max(200) int count) {
        return new Page(inbox.unread(me.getSubject()), inbox.latest(me.getSubject(), count));
    }

    @PostMapping("/api/v1/me/notifications/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void read(@AuthenticationPrincipal Jwt me, @PathVariable @jakarta.validation.constraints.Pattern(regexp = "\\d+-\\d+") String id) {
        if (!inbox.markRead(me.getSubject(), id)) throw new ApiException(new NotFound("Notification", id));
    }

    /// Browsers cannot add a token header to `EventSource`; a client reads this stream with `fetch` instead.
    @GetMapping(path = "/api/v1/me/notifications/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter stream(@AuthenticationPrincipal Jwt me) {
        return feed.open(me.getSubject());
    }

    record Draft(@NotBlank @Size(max = 255) String recipient, @NotBlank @Size(max = 120) String title,
                 @NotBlank @Size(max = 2000) String body, @Nullable URI link) {}

    record Page(long unread, List<Notification> notifications) {}
}
