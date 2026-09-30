package com.personal.portfolio.mail;

import com.personal.portfolio.mail.MailDispatcher.DispatchReport;
import com.personal.portfolio.mail.MailPayloads.OutboxStats;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.annotation.WriteOperation;
import org.springframework.stereotype.Component;

@Component
@Endpoint(id = "outbox")
@RequiredArgsConstructor
class MailOutboxEndpoint {

    private final MailService mail;
    private final MailDispatcher dispatcher;

    @ReadOperation
    public OutboxStats stats() {
        return mail.stats();
    }

    @WriteOperation
    public DispatchReport dispatch() {
        return dispatcher.dispatch();
    }
}
