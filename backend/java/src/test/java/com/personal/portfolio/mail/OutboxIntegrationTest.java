package com.personal.portfolio.mail;

import static org.mockito.Mockito.clearInvocations;

import com.personal.portfolio.mail.MailDispatcher.DispatchReport;
import com.personal.portfolio.support.IntegrationTest;
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.assertj.MvcTestResult;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.json.JsonMapper;

abstract class OutboxIntegrationTest extends IntegrationTest {

    private static final int MAX_DRAIN_ROUNDS = 100;

    @Autowired
    protected MailRepository messages;

    @Autowired
    protected MailDispatcher dispatcher;

    @Autowired
    protected TransactionTemplate transactions;

    @Autowired
    protected JsonMapper json;

    @Autowired
    protected Clock clock;

    protected static String address() {
        return "mail-" + UUID.randomUUID() + "@example.test";
    }

    protected MailMessage enqueue(Envelope envelope, Instant sendAt) {
        return messages.save(MailMessage.compose(envelope, sendAt, null));
    }

    protected MailMessage reload(long id) {
        return messages.findById(id).orElseThrow();
    }

    protected <T> T inTransaction(Supplier<T> work) {
        return Objects.requireNonNull(transactions.execute(_ -> work.get()));
    }

    protected void withdraw(long id) {
        transactions.executeWithoutResult(_ -> messages.findById(id)
                .filter(message -> message.getStatus() == MailStatus.PENDING)
                .ifPresent(MailMessage::cancel));
    }

    protected void drainOutbox() {
        var rounds = 0;
        while (rounds++ < MAX_DRAIN_ROUNDS && !DispatchReport.IDLE.equals(dispatcher.dispatch())) {
            clearInvocations(mailSender);
        }
        clearInvocations(mailSender);
    }

    protected String toJson(Object value) {
        return json.writeValueAsString(value);
    }

    protected <T> T read(MvcTestResult result, Class<T> type) {
        return json.readValue(result.getResponse().getContentAsByteArray(), type);
    }
}
