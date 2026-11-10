# Seed

Fills any service with data described in a file: fixed values, or values made up by [Datafaker](https://www.datafaker.net/).

| | |
|---|---|
| Port | 8084 |
| Data | none of its own |
| Depends on | Keycloak, for the `seed` client's token, and the services it fills |
| Demo | http://localhost:8084/demo/ with the `demo` profile |
| API reference | http://localhost:8084/swagger-ui.html |

## A plan

```yaml
targets:
  mail: http://localhost:8082

steps:
  - target: mail
    method: POST
    path: /api/v1/audiences
    as: audience                       # keep the answer under this name
    body:
      name: "#{book.genre} readers"
      description: Made up for a demo

  - target: mail
    method: POST
    path: /api/v1/audiences/{{audience.id}}/subscriptions
    repeat: 50                         # "give me 50 of these"
    body:
      email: "#{internet.safeEmailAddress}"
      name: "#{name.fullName}"
      position: "{{index}}"            # 1 to 50; a reference on its own keeps its type
```

- `#{...}` is any [Datafaker expression](https://www.datafaker.net/documentation/expressions/), evaluated again for every repetition. No code is needed for a new kind of data.
- `{{name.path}}` is a value from an answer saved with `as`; `{{index}}` is the repetition number.
- Fixed values are written as they are: `name: "Weekly news"` inserts exactly that.
- With `?seed=42`, the same plan makes up the same data every time.

The plan goes through each service's own API, with a token Keycloak issues to the `seed` client. Every service validates what it receives, so a plan cannot put into a database anything the service itself would refuse. The first refused call stops the run, and the report says which one and why.

## Running a plan

| How | When |
|---|---|
| `POST /api/v1/runs` with the plan as `application/yaml` (admin) | on demand |
| `SEED_FILE=file:/plans/start.yaml` (the `seed.file` property) | once at start; the service stops if the plan fails |
| The demo page | to edit and try a plan |

## Configuration

| Variable | Meaning | Default |
|---|---|---|
| `SEED_CLIENT_SECRET` | Secret of the `seed` client in Keycloak | none |
| `IDENTITY_TOKENS` | Keycloak's token endpoint | local Keycloak |
| `SEED_DEMO_MAIL_URL` | Where the demo plan finds the mail service | `http://localhost:8082` |

## Quality

```bash
./gradlew :services:seed:build :services:seed:mutationTest
```

The tests point plans at the service itself, where a test-only controller stands in for a real service and keeps what it receives.
