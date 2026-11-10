# 1. Keycloak for identity

Date: 2026-11-10. Status: accepted.

## Context

Every project needs registration, sign-in, passkeys, authenticator apps, invitations and roles. Written by hand, this was the largest and most security-sensitive part of the code, and each feature added more of it.

## Decision

Identity is Keycloak, configured through a realm file that Keycloak imports on start. There is no identity service in Java. Services validate Keycloak's access tokens as OAuth 2 resource servers and read the realm roles from them.

## Consequences

- Passkeys, TOTP, email verification, password reset, brute-force protection and organization invitations come configured, not coded.
- Keycloak is one more container, about 60 seconds to start, and stores its data in the same MySQL.
- Changing how sign-in behaves means editing the realm, not Java code.
- A service never sees a password.
