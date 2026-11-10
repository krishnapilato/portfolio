# 6. Seeding through the services' own APIs

Date: 2026-11-10. Status: accepted.

## Context

Seeding by writing to the databases directly is fast, but it bypasses every rule the services enforce, needs to know every schema, and gives the seeder the keys to every database.

## Decision

The seed service runs plans written in YAML against the services' public APIs, with its own Keycloak client and nothing else. A plan describes calls, not tables. Made-up values are Datafaker expressions inside the plan, so a new kind of data needs no code.

## Consequences

- A plan cannot put into a database what the service itself would refuse.
- Seeding a new service needs only its address in a plan.
- Large volumes are slower than bulk inserts. Plans are limited to 10,000 repetitions per step.
