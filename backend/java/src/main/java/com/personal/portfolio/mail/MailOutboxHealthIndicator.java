package com.personal.portfolio.mail;

import com.personal.portfolio.platform.AppProperties;
import java.time.Clock;
import java.time.Duration;
import org.springframework.boot.health.contributor.AbstractHealthIndicator;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.Status;
import org.springframework.stereotype.Component;

/// Reports DOWN when a due message has waited longer than app.mail.stale-after,
/// which means the dispatcher or the mail server is stuck.
@Component
class MailOutboxHealthIndicator extends AbstractHealthIndicator {

    private final MailService mail;
    private final Duration staleAfter;
    private final Clock clock;

    MailOutboxHealthIndicator(MailService mail, AppProperties properties, Clock clock) {
        super("Mail outbox health check failed");
        this.mail = mail;
        this.staleAfter = properties.mail().staleAfter();
        this.clock = clock;
    }

    @Override
    protected void doHealthCheck(Health.Builder health) {
        var stats = mail.stats();
        var staleBefore = clock.instant().minus(staleAfter);
        var oldestDue = stats.oldestDue();
        health.status(oldestDue != null && oldestDue.isBefore(staleBefore) ? Status.DOWN : Status.UP)
                .withDetail("pending", stats.byStatus().get(MailStatus.PENDING))
                .withDetail("failed", stats.byStatus().get(MailStatus.FAILED));
        if (oldestDue != null) {
            health.withDetail("oldestDue", oldestDue);
        }
    }
}
