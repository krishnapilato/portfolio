# 7. Tests against real MySQL and Redis

Date: 2026-11-10. Status: accepted.

## Context

An in-memory database in "MySQL mode" accepts SQL that MySQL refuses and maps types differently, so a green test run could still fail against the real database. UUIDs stored as `BINARY(16)` are an example.

## Decision

Integration tests start MySQL 26.10.0 and Redis 8.10.3 in containers with Testcontainers, once per test run, through Spring Boot's service connections.

## Consequences

- Tests prove the real migrations, types and queries.
- Running the tests needs Docker, locally and in CI.
- The first run downloads the images; later runs reuse them.
