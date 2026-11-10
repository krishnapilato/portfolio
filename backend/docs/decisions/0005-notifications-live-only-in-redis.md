# 5. Notifications live only in Redis

Date: 2026-11-10. Status: accepted.

## Context

In-app notifications are many, small and short-lived, and they say a lot about a person's activity. Keeping them forever in a relational database adds data to protect and nothing anyone reads.

## Decision

Each person's notifications are a Redis stream trimmed to the newest 200, with a set of what was read next to it. Both expire 30 days after the last notification. New ones are announced on a Redis channel, so whichever instance holds the person's live connection pushes them as server-sent events.

## Consequences

- Old notifications disappear on their own, without a cleanup job.
- The service scales out without sticky sessions.
- Losing Redis loses notifications. Something that must not be lost belongs in the mail service or in the system of record that caused it, not here.
