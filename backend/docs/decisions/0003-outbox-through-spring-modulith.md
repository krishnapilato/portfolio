# 3. An outbox through Spring Modulith

Date: 2026-11-10. Status: accepted.

## Context

A message must leave only if the change that caused it was saved, and must not be lost if the service stops right after. Sending inside the request couples a slow mail server to every request; a hand-written outbox table and poller is several hundred lines that every project would copy.

## Decision

The mail service stores the rendered message and publishes an event in the same transaction. Spring Modulith's event publication registry records that event in the database with the transaction, delivers it to an asynchronous listener after the commit, and republishes what was not completed when the service starts again. Retries of a failing mail server use Spring Framework's own `@Retryable`.

## Consequences

- No outbox code of our own, and no extra dependency for retries.
- A message can be sent twice if the service stops between handing it to the server and recording that it did. Mail has no exactly-once delivery anyway; recipients may see a duplicate, never a gap.
- The message body is deleted once the message is delivered or given up.
