package com.example.seed.plan;

import module java.base;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.jspecify.annotations.Nullable;

/// What to seed, as read from a YAML or JSON file. `targets` names the services by their base address; each step
/// calls one of them. Inside `path` and `body`, `{{name.path}}` is replaced by a value from the response a previous
/// step saved `as` that name, `{{index}}` by the repetition number from 1, and any `#{...}` is a Datafaker
/// expression evaluated fresh for every repetition.
public record Plan(@NotEmpty Map<String, URI> targets, @NotEmpty List<@Valid Step> steps) {

    public record Step(
        @NotBlank String target,
        @NotNull @Pattern(regexp = "GET|POST|PUT|PATCH|DELETE") String method,
        @NotBlank @Pattern(regexp = "/.*") String path,
        @Nullable @Min(1) @Max(10_000) Integer repeat,
        @Nullable Object body,
        @Nullable @Pattern(regexp = "[A-Za-z][A-Za-z0-9_]*") String as) {

        public Step {
            repeat = Objects.requireNonNullElse(repeat, 1);
        }
    }
}
