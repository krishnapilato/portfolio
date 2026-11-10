package com.example.notification;

import module java.base;

import jakarta.validation.constraints.Min;
import org.hibernate.validator.constraints.time.DurationMin;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/// An inbox keeps at most `inboxSize` notifications, and disappears `retention` after the last one arrived.
@Validated
@ConfigurationProperties("notification")
public record NotificationProperties(
    @DefaultValue("200") @Min(1) int inboxSize,
    @DefaultValue("30d") @DurationMin(minutes = 1) Duration retention,
    @DefaultValue("30m") @DurationMin(seconds = 1) Duration streamTimeout) {
}
