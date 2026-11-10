package com.example.mail;

import module java.base;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/// `publicUrl` is where recipients reach this service, so confirmation and unsubscribe links point at it.
/// `secret` is base64 of at least 32 random bytes; it signs those links.
@Validated
@ConfigurationProperties("mail")
public record MailProperties(
    @NotBlank @Email String from,
    @DefaultValue("Foundation") String sender,
    @NotNull URI publicUrl,
    @NotBlank @Pattern(regexp = "[A-Za-z0-9+/]{43,}={0,2}", message = "must be base64 of at least 32 bytes") String secret) {

    @Override
    public String toString() {
        return "MailProperties[from=%s, sender=%s, publicUrl=%s, secret=<redacted>]".formatted(from, sender, publicUrl);
    }
}
