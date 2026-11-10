package com.example.mail.template;

import module java.base;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Templates", description = "Mustache templates every message is rendered from. Administrators only.")
@RestController
@RequestMapping("/api/v1/templates")
@PreAuthorize("hasRole('admin')")
@RequiredArgsConstructor
class TemplateController {

    private final Templates templates;

    @GetMapping
    List<TemplateView> list() {
        return templates.all().stream().map(TemplateView::of).toList();
    }

    @GetMapping("/{name}")
    TemplateView get(@PathVariable String name) {
        return TemplateView.of(templates.find(name));
    }

    @PutMapping("/{name}")
    TemplateView save(@PathVariable @Pattern(regexp = "[a-z0-9-]{1,64}") String name, @Valid @RequestBody TemplateDraft draft) {
        return TemplateView.of(templates.save(name, draft.subject(), draft.body()));
    }

    @DeleteMapping("/{name}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable String name) {
        templates.delete(name);
    }

    record TemplateDraft(@NotBlank @Size(max = 255) String subject, @NotBlank @Size(max = 1_000_000) String body) {}

    record TemplateView(String name, String subject, String body, Instant updatedAt) {

        static TemplateView of(MessageTemplate template) {
            return new TemplateView(template.getName(), template.getSubject(), template.getBody(), template.getUpdatedAt());
        }
    }
}
