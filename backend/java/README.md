## Portfolio Backend API (Spring Boot)

Production-ready REST API for a personal portfolio: authentication, user management, and email workflows. Built on Spring Boot 4 (milestone) with Java 24, secured via JWT, documented with OpenAPI/Swagger, and containerized for local development.

Key URLs (dev):
- App: http://localhost:8080/
- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI JSON: http://localhost:8080/v3/api-docs

Deployed example: https://khovakrishnapilato-backend.eu-south-1.elasticbeanstalk.com

## Features

- JWT auth (HS512) with daily key rotation persisted in DB
- User CRUD and account lifecycle (activate, lock/unlock, role change, password reset)
- Email delivery (single, bulk, attachments, scheduled) via SMTP (Mailtrap in dev)
- Actuator health/info and structured logging with rolling files
- OpenAPI groups per domain with Swagger UI
- CORS for local SPA and deployed domain

## Tech stack

- Language/Runtime: Java 24
- Frameworks: Spring Boot 4.0.0-M1, Spring Web, Spring Security, Spring Data JPA, Validation, Actuator, Thymeleaf
- Auth: JJWT 0.12.x (HS512)
- Database: MySQL (Connector/J 9.x)
- Docs: springdoc-openapi 2.x
- Build: Maven (wrapper), Docker (dev image), Docker Compose

## API surface (high level)

- Auth: POST /auth/login, POST /auth/signup
- Users: GET/POST/PUT/DELETE /api/users, plus:
    - GET /api/users/{id}
    - PUT /api/users/{id}/lock
    - PUT /api/users/{id}/role?role=ADMIN|USER
    - PUT /api/users/{id}/activate
    - POST /api/users/reset-password?email=...&newPassword=...
- Email: under /api/email
    - POST /send, /send-with-attachment, /send-bulk, /schedule
    - POST /forgot-password, /resend-confirmation
    - GET /status/{emailId}
- Landing page: GET /

Use Swagger UI for precise schemas, examples, and response codes.

## Configuration

Profiles
- Default: dev (spring.profiles.active=dev)
- prod: tighten logging and disables dev conveniences

Essential environment variables (override defaults in application.yaml):
- SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD
- SPRING_DATASOURCE_URL (override when using Dockerized MySQL or non-default ports)
- SPRING_MAIL_USERNAME, SPRING_MAIL_PASSWORD (Mailtrap or real SMTP)
- PORT (defaults to 8080)
- bcrypt.strength (default 12; valid 4–31)

Admin bootstrap (dev only)
- On startup, a default admin is created if absent using values configured in application.yaml (see spring.security.user.* via AdminConfig). Not active in prod.

CORS
- Allowed origins include http://localhost:4200 and the Elastic Beanstalk domain. Update SecurityConfiguration.corsConfigurationSource() to add more.

Logging
- logs/application.log with daily+size rolling (logback-spring.xml). Actuator health/info exposed.

## Run locally (Windows)

Prerequisites
- JDK 24 (required by Maven Enforcer)
- Maven Wrapper (included)
- MySQL 8+ (local) or Docker Desktop

Option A — Native run (using your local MySQL)
1) Ensure a MySQL instance is available and credentials are set via env vars.
2) From backend/java:

```cmd
mvnw.cmd spring-boot:run
```

Option B — Docker Compose (MySQL + dev app container)
From backend/java execute:

```cmd
powershell -File .\make.ps1 up
```

Notes
- The compose file maps MySQL to host port 3307 and the app to 8080.
- When running the app on your host against the Dockerized DB, override the datasource URL:

```cmd
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3307/database?createDatabaseIfNotExist=true
mvnw.cmd spring-boot:run
```

## Build, test, and package

Run tests:
```cmd
mvnw.cmd -q test
```

Create a runnable JAR:
```cmd
mvnw.cmd -q clean package
```

The artifact will be under target/. Start it with:
```cmd
java -jar target\portfolio-0.0.5.jar
```

## Security model

- Stateless JWT auth via Authorization: Bearer <token>
- HS512-signed tokens; secret keys rotated daily (scheduled job) and stored in MySQL (JwtKeys table)
- Public endpoints: /, /auth/**, /api/email/**, /swagger-ui/**, /v3/api-docs/**

## Database

- Default schema name: database (see init.sql)
- JPA hibernate.ddl-auto=update for dev convenience; prefer migrations for prod

## Observability

- Health: /actuator/health (details for authorized only)
- Info: /actuator/info
- Logs: rolling file and console (dev)

## Swagger/OpenAPI

- UI: /swagger-ui
- Grouped APIs: 01-Authentication, 02-User, 03-Email
- Global bearerAuth security scheme with JWT in Authorization header

## Notes & caveats

- This project targets Java 24 and Spring Boot 4.0.0-M1; ensure a matching toolchain.
- Do not commit real secrets. Values in application.yaml are for local development and must be overridden via environment variables in any shared or production environment.
- If you run only MySQL via Docker (port 3307) and the app natively, remember to update SPRING_DATASOURCE_URL accordingly.

## Contributing

PRs are welcome. Please include tests for behavioral changes and follow existing code style. For significant changes, open an issue first to discuss scope.

## License

Unless stated otherwise in the repository root, all rights reserved Khova Krishna Pilato.
