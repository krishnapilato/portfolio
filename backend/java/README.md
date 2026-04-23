# Portfolio Backend API

[![Java](https://img.shields.io/badge/Java-25.0.3-orange.svg)](https://java.oracle.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0--M4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-9.6-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

A high-performance, enterprise-grade REST API built as the backend engine for a personal portfolio. Engineered with modern **Java 25** and **Spring Boot 4.1.0-M4**, this service handles secure authentication, robust user management, and automated email workflows.

It features a stateless security architecture with automated JWT key rotation, versioned Flyway migrations, filterable paginated user management, and high-throughput asynchronous logging.

### Quick Links
- **Live Production Example:** [khovakrishnapilato-backend.eu-south-1.elasticbeanstalk.com](https://khovakrishnapilato-backend.eu-south-1.elasticbeanstalk.com)
- **Local Application:** [`http://localhost:8080/`](http://localhost:8080/)
- **Swagger UI (Interactive API):** [`http://localhost:8080/swagger-ui/index.html`](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI 3.0 JSON:** [`http://localhost:8080/v3/api-docs`](http://localhost:8080/v3/api-docs)

---

## Core Features

*   **Advanced Security:** Stateless JWT authentication (HS512) with automated, database-persisted daily key rotation to prevent token tampering.
*   **User Identity & Access:** Complete user lifecycle management including registration, role-based access control (Admin/User), account locking, secure password resets, and paginated admin search.
*   **Email Engine:** SMTP integration (Mailtrap for dev, scalable in prod) supporting single delivery, bulk dispatch, attachments, and scheduled messaging.
*   **Resilient Observability:** Integrated Spring Actuator for health metrics and highly optimized asynchronous rolling file logs (`logback-spring.xml`).
*   **Developer Experience (DX):** Fully containerized local environment using Docker Compose and automatic schema migration on startup.
*   **Interactive Documentation:** Auto-generated, grouped OpenAPI 3.0 specifications available via Swagger UI.

---

## Technology Stack

| Category | Technologies                                                |
| :--- |:------------------------------------------------------------|
| **Core Runtime** | Java 25.0.3, Spring Boot 4.1.0-M4                           |
| **Data Layer** | Spring Data JPA, Hibernate, Flyway, MySQL 9.6, HikariCP     |
| **Security** | Spring Security, JJWT 0.13.0, BCrypt                        |
| **DevOps & Infrastructure** | Docker, Docker Compose, Maven Wrapper                       |
| **Observability & Docs** | Springdoc OpenAPI (Swagger), Spring Actuator, SLF4J/Logback |

---

## Getting Started (Local Development)

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
*   *Optional:* JDK 25 installed locally if you wish to run outside of Docker.

### Recommended: Docker Compose
The easiest way to run the application. This spins up a MySQL database and the Spring Boot application in isolated containers with the same migration-backed startup path used elsewhere in the project.

```bash
# 1. Start the database and application
docker compose up -d --build

# 2. View the application logs
docker compose logs -f app
```

### Alternative: Native Run (Local JDK)
If you prefer running the application directly on your host machine against the Dockerized database:

```bash
# 1. Start only the database container (mapped to port 3307)
docker compose up -d mysql

# 2. Export the database URL environment variable (Windows CMD)
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3307/database?createDatabaseIfNotExist=true

# 3. Run the application via Maven Wrapper
./mvnw spring-boot:run
```

---

## Configuration & Environment Variables

The application uses Spring Profiles (`dev`, `prod`, `test`) to manage environments securely. You can override default behaviors using the following environment variables:

| Variable | Description | Default (Dev) |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active runtime profile (`dev` or `prod`). | `dev` |
| `PORT` | The port the application listens on. | `8080` |
| `SPRING_DATASOURCE_URL` | JDBC connection string. | `jdbc:mysql://localhost:3306/database` |
| `SPRING_DATASOURCE_USERNAME` | Database user. | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password. | `root` |
| `SPRING_MAIL_USERNAME` | SMTP User (e.g., Mailtrap). | *None* |
| `SPRING_MAIL_PASSWORD` | SMTP Password. | *None* |
| `ADMIN_EMAIL` | Auto-provisioned admin email (Dev only). | `admin.email@gmail.com` |
| `ADMIN_PASSWORD` | Auto-provisioned admin password (Dev only).| `1234567890` |

---

## API Surface (High Level)

All endpoints (except public routes) require a valid JWT passed in the `Authorization: Bearer <token>` header. For strict payloads and examples, please consult the **Swagger UI**.

*   **Authentication** (`/auth/**`)
*   `POST /auth/signup` - Register a new user
*   `POST /auth/login` - Authenticate and receive JWT
*   `POST /auth/forgot-password` - Request a password reset
*   `POST /auth/reset-password` - Reset a password with a valid token
*   **User Management** (`/api/users/**`)
*   `GET /api/users` - Retrieve paginated users with `role`, `enabled`, `locked`, and `search` filters (Admin)
*   `PUT /api/users/{id}/lock` - Toggle account lock (Admin)
*   `PUT /api/users/{id}/role` - Update user permissions (Admin)
*   `DELETE /api/users/{id}` - Delete a user and related reset tokens (Admin)
*   **Email Services** (`/api/email/**`)
*   `POST /api/email/send` - Dispatch standard email
*   `POST /api/email/send-bulk` - Dispatch batch emails
*   `POST /api/email/schedule` - Queue email for future delivery

---

## Build, Test, and Deploy

**Run Unit & Integration Tests:**
```bash
./mvnw clean test
```

**Build Production Executable:**
```bash
./mvnw clean package -DskipTests
```
*The resulting highly-optimized `.jar` will be generated in the `/target` directory.*

---

## Security Notes & Best Practices

*   **Database Migrations:** Schema changes are managed through versioned Flyway scripts under `src/main/resources/db/migration`. Both `dev` and `prod` validate the mapped schema instead of mutating it implicitly.
*   **CORS Configuration:** Allowed origins are restricted. To add new frontend clients, update `SecurityConfiguration.corsConfigurationSource()`.
*   **Secrets:** Never commit real SMTP credentials or Production Database passwords to version control. Always inject them via environment variables in your deployment environment (e.g., AWS Elastic Beanstalk).

---

## License

Unless stated otherwise in the repository root, all rights reserved **Khova Krishna Pilato**.
