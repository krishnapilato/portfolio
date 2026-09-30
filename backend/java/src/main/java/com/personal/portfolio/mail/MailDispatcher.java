package com.personal.portfolio.mail;

import com.personal.portfolio.platform.AppProperties;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Gatherers;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Limit;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
class MailDispatcher {

    private static final String METRIC = "portfolio.mail.dispatched";

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
        var due = messages.lockDue(MailStatus.PENDING, clock.instant(), Limit.of(settings.batchSize()));
        if (due.isEmpty()) {
            return DispatchReport.IDLE;
        }
        var parcels = due.stream().map(Parcel::of).toList();
        var deliveries = parcels.stream()
                .gather(Gatherers.mapConcurrent(settings.concurrency(), this::deliver))
                .toList();
        var report = settle(due, deliveries);
        sentCounter.increment(report.sent());
        failedCounter.increment(report.failed());
        log.info("Dispatched {} outbox message(s): {} sent, {} failed", deliveries.size(), report.sent(),
                report.failed());
        return report;
    }

    private Delivery deliver(Parcel parcel) {
        try {
            gateway.send(parcel.envelope());
            return new Sent(parcel.id());
        } catch (MailException e) {
            var reason = Objects.requireNonNullElse(e.getMostSpecificCause().getMessage(), e.getClass().getName());
            log.warn("Delivery of mail {} failed: {}", parcel.id(), reason);
            return new Failed(parcel.id(), reason);
        }
    }

    private DispatchReport settle(List<MailMessage> due, List<Delivery> deliveries) {
        Map<Long, MailMessage> byId = due.stream().collect(Collectors.toMap(MailMessage::getId, Function.identity()));
        var now = clock.instant();
        var sent = 0;
        for (var delivery : deliveries) {
            var message = byId.get(delivery.id());
            switch (delivery) {
                case Sent _ -> {
                    message.markSent(now);
                    sent++;
                }
                case Failed(_, var reason) -> message.markFailed(reason, now, settings.maxAttempts(),
                        settings.initialBackoff(), settings.maxBackoff());
            }
        }
        return new DispatchReport(sent, deliveries.size() - sent);
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

    private record Parcel(long id, Envelope envelope) {

        static Parcel of(MailMessage message) {
            return new Parcel(message.getId(), message.envelope());
        }
    }

    private sealed interface Delivery {

        long id();
    }

    private record Sent(long id) implements Delivery {}

    private record Failed(long id, String reason) implements Delivery {}
}
