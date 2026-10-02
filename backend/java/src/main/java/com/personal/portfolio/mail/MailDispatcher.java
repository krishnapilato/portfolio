package com.personal.portfolio.mail;

import com.personal.portfolio.platform.AppProperties;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Clock;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Gatherers;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Limit;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/// Delivers the mail outbox. Messages are saved in the same transaction as the change that caused them,
/// and this poller sends them afterwards with retries, so a slow or broken SMTP server never fails a request.
@Slf4j
@Component
class MailDispatcher {

    private static final String METRIC = "portfolio.mail.dispatched";
    private static final Set<MailStatus> FINISHED = Set.of(MailStatus.SENT, MailStatus.FAILED, MailStatus.CANCELLED);

    private final MailRepository messages;
    private final MailGateway gateway;
    private final AppProperties.Mail settings;
    private final Clock clock;
    private final Counter sentCounter;
    private final Counter failedCounter;

    MailDispatcher(MailRepository messages, MailGateway gateway, AppProperties properties, Clock clock,
            MeterRegistry meters) {
        this.messages = messages;
        this.gateway = gateway;
        this.settings = properties.mail();
        this.clock = clock;
        this.sentCounter = counter(meters, "sent");
        this.failedCounter = counter(meters, "failed");
    }

    @Scheduled(fixedDelayString = "${app.mail.poll-interval}", initialDelayString = "${app.mail.poll-interval}")
    @Transactional
    public DispatchReport dispatch() {
        // SELECT ... FOR UPDATE SKIP LOCKED: several instances can poll at once and never pick the same message.
        var due = messages.lockDue(MailStatus.PENDING, clock.instant(), Limit.of(settings.batchSize()));
        if (due.isEmpty()) {
            return DispatchReport.IDLE;
        }
        // Envelopes are read here, inside the transaction; the virtual threads below only talk to the SMTP server.
        var parcels = due.stream().map(message -> new Parcel(message, message.envelope())).toList();
        var deliveries = parcels.stream()
                .gather(Gatherers.mapConcurrent(settings.concurrency(), this::deliver))
                .toList();
        var now = clock.instant();
        var sent = 0;
        for (var delivery : deliveries) {
            var error = delivery.error();
            if (error == null) {
                delivery.message().markSent(now);
                sent++;
            } else {
                delivery.message().markFailed(error, now, settings.maxAttempts(), settings.initialBackoff(),
                        settings.maxBackoff());
            }
        }
        var report = new DispatchReport(sent, deliveries.size() - sent);
        sentCounter.increment(report.sent());
        failedCounter.increment(report.failed());
        log.info("Dispatched {} outbox message(s): {} sent, {} failed", deliveries.size(), report.sent(),
                report.failed());
        return report;
    }

    @Scheduled(cron = "0 23 3 * * *")
    @Transactional
    public int purge() {
        var purged = messages.deleteByStatusInAndUpdatedAtBefore(FINISHED, clock.instant().minus(settings.retention()));
        if (purged > 0) {
            log.info("Purged {} finished outbox message(s)", purged);
        }
        return purged;
    }

    private Delivery deliver(Parcel parcel) {
        try {
            gateway.send(parcel.envelope());
            return new Delivery(parcel.message(), null);
        } catch (MailException e) {
            var reason = Objects.requireNonNullElse(e.getMostSpecificCause().getMessage(), e.getClass().getName());
            log.warn("Delivery of mail {} failed: {}", parcel.message().getId(), reason);
            return new Delivery(parcel.message(), reason);
        }
    }

    private static Counter counter(MeterRegistry meters, String outcome) {
        return Counter.builder(METRIC)
                .description("Outbox messages handed to the mail server, by outcome")
                .tag("outcome", outcome)
                .register(meters);
    }

    record DispatchReport(int sent, int failed) {

        static final DispatchReport IDLE = new DispatchReport(0, 0);
    }

    private record Parcel(MailMessage message, Envelope envelope) {}

    private record Delivery(MailMessage message, @Nullable String error) {}
}
