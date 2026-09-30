package com.personal.portfolio.mail;

import com.personal.portfolio.mail.Notification.PasswordChanged;
import com.personal.portfolio.mail.Notification.ResetPassword;
import com.personal.portfolio.mail.Notification.VerifyEmail;
import com.personal.portfolio.platform.AppProperties;
import java.time.Duration;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

@Component
@RequiredArgsConstructor
class NotificationRenderer {

    private static final Locale LOCALE = Locale.ENGLISH;
    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter
            .ofPattern("d MMMM uuuu 'at' HH:mm 'UTC'", LOCALE)
            .withZone(ZoneOffset.UTC);
    private static final long MINUTES_PER_HOUR = Duration.ofHours(1).toMinutes();
    private static final long MINUTES_PER_DAY = Duration.ofDays(1).toMinutes();

    private final ITemplateEngine templates;
    private final AppProperties properties;

    Envelope render(Notification notification) {
        var template = templateOf(notification);
        var context = new Context(LOCALE);
        context.setVariables(template.variables());
        context.setVariable("mail", notification);
        context.setVariable("subject", template.subject());
        context.setVariable("brand", properties.mail().sender());
        context.setVariable("home", properties.frontendUrl());
        var body = templates.process(template.view(), context);
        return Envelope.html(notification.recipient(), template.subject(), body);
    }

    private static Template templateOf(Notification notification) {
        return switch (notification) {
            case VerifyEmail _ -> new Template("mail/verify-email", "Confirm your email address", Map.of());
            case ResetPassword(_, _, _, _, var validity) -> new Template("mail/reset-password",
                    "Reset your password", Map.of("validity", humanize(validity)));
            case PasswordChanged(_, _, var changedAt) -> new Template("mail/password-changed",
                    "Your password was changed", Map.of("changedAt", TIMESTAMP.format(changedAt)));
        };
    }

    private static String humanize(Duration duration) {
        var minutes = Math.max(1, duration.toMinutes());
        if (minutes % MINUTES_PER_DAY == 0) {
            return quantity(minutes / MINUTES_PER_DAY, "day");
        }
        if (minutes % MINUTES_PER_HOUR == 0) {
            return quantity(minutes / MINUTES_PER_HOUR, "hour");
        }
        return quantity(minutes, "minute");
    }

    private static String quantity(long amount, String unit) {
        return amount + " " + (amount == 1 ? unit : unit + "s");
    }

    private record Template(String view, String subject, Map<String, Object> variables) {}
}
