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

Java 27, Spring Boot 4.1.2 and Gradle 9.9.0. Keycloak handles identity; independent services for mail and newsletters, live notifications and seeding share a `core` module, one build and one set of strict quality gates. Each has its own image, pages, API reference and live demo.

```sh
cd backend
cp .env.example .env
docker compose up --build --wait    # Keycloak, MySQL, Redis, Mailpit and the three services
./gradlew build
./gradlew dependencyUpdates
```

On Windows, use `gradlew.bat` in place of `./gradlew`. See the [backend README](backend/README.md) for addresses, running one service at a time, the quality gates and the open-source projects it uses.

## Automation

The frontend workflow installs from the lockfile, lints, builds and deploys to GitHub Pages. The backend workflow runs the build with its quality gates and a check that fails while an update is not applied. Dependabot proposes updates daily. Secrets and generated artifacts stay outside version control.

## Rights

The backend is open source under the [MIT licence](backend/LICENSE) and lists the open-source projects it uses in its README. Everything else is all rights reserved © Khova Krishna Pilato unless otherwise stated.
