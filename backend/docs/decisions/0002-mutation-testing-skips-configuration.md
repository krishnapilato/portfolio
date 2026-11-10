# 2. Mutation testing skips Spring configuration classes

Date: 2026-11-10. Status: accepted.

## Context

PIT runs, for each mutant, only the tests that covered the mutated line. Methods that declare Spring beans run once, when the first test starts the application context, so PIT credits them to that test alone. A mutant that removes the CORS setup then survives, although the CORS tests would catch it.

## Decision

Classes named `*Configuration` are left out of mutation testing. They hold wiring only; any rule in them moves to its own class, which is mutated as usual. `RealmRoles` is the first example.

## Consequences

- The mutation score measures logic, not wiring.
- The wiring is still covered by integration tests and counts toward the 90 % coverage gate.
