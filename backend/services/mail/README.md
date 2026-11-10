# Mail

Transactional mail and newsletters, rendered from templates you can change without a release.

| | |
|---|---|
| Port | 8082 |
| Data | MySQL (`mail` database), schema by Flyway |
| Depends on | Keycloak for tokens, an SMTP server (Mailpit locally) |
| Demo | http://localhost:8082/demo/ with the `demo` profile |
| API reference | http://localhost:8082/swagger-ui.html |

## What it does

- **Templates** are Mustache, stored in the database and edited through the API (`PUT /api/v1/templates/{name}`). Mustache has no logic, so a stored template can fill in values but never run code on the server. Values are HTML-escaped in the body; the subject is kept on one line, so a value cannot add a mail header.
- **Messages** (`POST /api/v1/messages`) are rendered and stored in the caller's transaction, then delivered in the background. Spring Modulith records the event in the same transaction, so a crash in between delays a message but never loses it. A mail server that is briefly away gets four more tries, two seconds apart and doubling. The body is deleted once the message is delivered or given up.
- **Newsletters**: audiences, double opt-in subscriptions and campaigns. Asking to subscribe answers the same whether or not the address is already on the list, so the list stays private. Confirmation and unsubscribe links carry an HMAC-signed token instead of a stored one. Opening a link only shows a button, because mail scanners follow links on their own; mail clients get RFC 8058 one-click unsubscribe.

## API

| Endpoint | Who |
|---|---|
| `GET, PUT, DELETE /api/v1/templates/{name}`, `GET /api/v1/templates` | admin |
| `POST /api/v1/messages`, `GET /api/v1/messages`, `GET /api/v1/messages/{id}` | admin |
| `POST /api/v1/audiences`, `GET /api/v1/audiences`, `GET /api/v1/audiences/{id}/subscribers` | admin |
| `POST /api/v1/audiences/{id}/campaigns` | admin |
| `POST /api/v1/audiences/{id}/subscriptions` | anyone |
| `GET, POST /subscriptions/confirm?token=…`, `GET, POST /subscriptions/unsubscribe?token=…` | anyone with the link |

## Configuration

| Variable | Meaning | Default |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL | `localhost:3307/mail`, `root`, none |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_STARTTLS` | SMTP server | Mailpit on `localhost:1025` |
| `MAIL_FROM`, `MAIL_SENDER` | Sender address and name | `no-reply@foundation.local`, `Foundation` |
| `MAIL_PUBLIC_URL` | Where recipients reach this service, for links | `http://localhost:8082` |
| `MAIL_SECRET` | Base64 of at least 32 random bytes; signs the links | none |
| `IDENTITY_ISSUER`, `IDENTITY_JWKS` | Keycloak realm and its keys | local Keycloak |

## Run

```bash
docker compose up --build --wait mail       # from backend/, with what it needs
./gradlew :services:mail:bootRun            # or from the IDE: MailApplication, with MySQL and Mailpit running
```

## Quality

```bash
./gradlew :services:mail:build :services:mail:mutationTest
```

Tests run against MySQL 26.10.0 in a container (Testcontainers), so they need Docker. The mail server is a mock that keeps each message as it is handed over.
