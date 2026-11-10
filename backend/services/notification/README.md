# Notifications

In-app notifications that reach every open session the moment they are sent.

| | |
|---|---|
| Port | 8083 |
| Data | Redis only; nothing goes to a database |
| Depends on | Keycloak for tokens |
| Demo | http://localhost:8083/demo/ with the `demo` profile |
| API reference | http://localhost:8083/swagger-ui.html |

## What it does

- Each person's notifications are a **Redis stream**, appended in order and trimmed to the newest 200. What was read is a set next to it. Both disappear 30 days after the last notification: old notifications are not kept anywhere.
- A person is the subject of their Keycloak token, so everyone reads only their own inbox.
- Every new notification is announced on a Redis channel. Whichever instance holds the person's open stream pushes it at once as a server-sent event, so the service scales out without sticky sessions.

## API

| Endpoint | Who |
|---|---|
| `POST /api/v1/notifications` | admin |
| `GET /api/v1/me/notifications?count=50` | the signed-in person |
| `POST /api/v1/me/notifications/{id}/read` | the signed-in person |
| `GET /api/v1/me/notifications/stream` (server-sent events) | the signed-in person |

Browsers cannot add a token header to `EventSource`, so a client reads the stream with `fetch`.

## Configuration

| Variable or property | Meaning | Default |
|---|---|---|
| `REDIS_HOST`, `REDIS_PORT` | Redis | `localhost:6379` |
| `notification.inbox-size` | Notifications kept per person | 200 |
| `notification.retention` | How long an inbox lives after its last notification | 30 days |
| `notification.stream-timeout` | How long a live stream stays open; clients reconnect | 30 minutes |
| `IDENTITY_ISSUER`, `IDENTITY_JWKS` | Keycloak realm and its keys | local Keycloak |

## Run

```bash
docker compose up --build --wait notification
./gradlew :services:notification:bootRun
```

## Quality

```bash
./gradlew :services:notification:build :services:notification:mutationTest
```

Tests run against Redis 8.10.3 in a container (Testcontainers). The live-stream test opens a real HTTP connection and waits for the event.
