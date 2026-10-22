package com.personal.portfolio.mail;

import module java.base;

import com.personal.portfolio.platform.AppProperties;
import org.springframework.boot.health.contributor.AbstractHealthIndicator;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.Status;
import org.springframework.stereotype.Component;

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
        var oldestDue = stats.oldestDue();
        var stale = oldestDue != null && oldestDue.isBefore(clock.instant().minus(staleAfter));
        health.status(stale ? Status.DOWN : Status.UP)
            .withDetail("pending", stats.byStatus().get(MailStatus.PENDING))
            .withDetail("failed", stats.byStatus().get(MailStatus.FAILED));
        if (oldestDue != null) health.withDetail("oldestDue", oldestDue);
    }
}
