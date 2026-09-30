package com.personal.portfolio.system;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.audit.listener.AuditApplicationEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class AuditMetrics {

    private final MeterRegistry registry;

    @EventListener
    void on(AuditApplicationEvent event) {
        registry.counter("portfolio.audit.events", "type", event.getAuditEvent().getType()).increment();
    }
}
