# Portfolio & Application Foundation

A personal portfolio for Khova Krishna Pilato, alongside a reusable Java application foundation. Both share a quiet visual language built around privacy, security and thoughtful engineering.

[Live portfolio](https://krishnapilato.github.io/portfolio/)

## Frontend

React 19, TypeScript 7, Vite 8 and GSAP. Eight sections connect professional experience and measurable impact with a philosophy of responsibility in software. Scroll reveals and exits run in both directions; reduced-motion preferences limit large movements while retaining fades.

```sh
cd frontend
npm ci
npm run dev
```

Validation and production build:

```sh
npm run lint
npm run build
npm run preview
```

The production site uses local assets, system fonts and a self-only CSP, with no analytics or tracking cookies. See the [frontend README](frontend/README.md) for content, motion and deployment details.

## Backend

Java 27 and Spring Boot 4.1.2. Accounts, authentication, rotating tokens, transactional email, observability and responsive landing/error heroes. The generic entry point is `com.example.application.Application`; the packaged artifact is `backend/target/application.jar`.

With Docker Compose:

```sh
cd backend
cp .env.example .env
# Set the required secrets and local configuration before starting.
docker compose up --build --wait
```

With JDK 27 and a configured local database and SMTP server:

```sh
cd backend
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd` in place of `./mvnw`. Application, API documentation and local mail inbox are available at `http://localhost:8080/`, `http://localhost:8080/swagger-ui.html` and `http://localhost:8025/` respectively when using Compose.

Validation:

```sh
./mvnw verify
./mvnw -Pmutation -Djacoco.skip=true test-compile org.pitest:pitest-maven:mutationCoverage
```

See the [backend README](backend/README.md) for environment variables, security decisions, API endpoints and quality gates. Tests use H2 and do not need Docker.

## Automation

The frontend workflow installs from the lockfile, lints, builds and deploys to GitHub Pages. The backend workflow runs validation, mutation testing and a container build. Dependabot checks dependencies weekly. Secrets and generated artifacts stay outside version control.

## Rights

All rights reserved © Khova Krishna Pilato unless otherwise stated. Check the module documentation for any separately stated licensing terms.
