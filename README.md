## Portfolio — Angular SSR frontend + Spring Boot API

![Java](https://badgen.net/badge/Java/25.0.2/blue?icon=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0--M3-brightgreen?style=flat&logo=spring-boot)
![Angular](https://img.shields.io/badge/React-19.2.4-blue?style=flat&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-9.6.0-blue?style=flat&logo=mysql)
![Version](https://img.shields.io/badge/Version-0.0.5-blue?style=flat)
[![CI](https://github.com/krishnapilato/portfolio/actions/workflows/github-actions.yml/badge.svg)](https://github.com/krishnapilato/portfolio/actions)

Monorepo hosting a production-ready React 19 frontend and a Spring Boot 4 API. Clean UX, fast first paint, email contact flow, OpenAPI docs, and containerized local dev.

- Live site: https://krishnapilato.github.io/portfolio

### Layout

- `frontend/react-app` — React 19.2 portfolio app
- `backend/java` — Spring Boot 4 API (JWT, OpenAPI, MySQL), Docker-compose for dev

For deep details, see the module READMEs:
- Frontend: `frontend/react-app/README.md`
- Backend: `backend/java/README.md`

---

## Quickstart (Windows)

Clone and switch to the development branch:

```cmd
git clone https://github.com/krishnapilato/portfolio.git
cd portfolio
git checkout dev
```

### Backend (Spring Boot API)

Prereqs: JDK 24, MySQL 8+ (local) or Docker Desktop.

Option A — native run against your DB:

```cmd
cd backend\java
mvnw.cmd spring-boot:run
```

Option B — Docker (MySQL + app container):

```cmd
cd backend\java
powershell -File .\make.ps1 up
```

Dev URLs:
- App root: http://localhost:8080/
- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI JSON: http://localhost:8080/v3/api-docs

### Frontend (React)

Prereqs: Node 24+, npm 11+.

Dev server:

```cmd
cd frontend\react-app
npm install --legacy-peer-deps
npm run dev -- --host
```

---

## Configuration

- Backend environment (DB, SMTP, ports): see `backend/java/README.md` → Configuration. Common vars: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`.

---

## Lighthouse

Current scores (last run: 2025‑08‑08):

| Target | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|---------------|----------------|-----|
| Desktop | 100 | 96 | 96 | 91 |
| Mobile  | 98 | 96 | 96 | 91 |

How to re-run locally:
1) Start the frontend (dev or SSR).
2) Use Lighthouse in Chrome DevTools, or run via CLI (desktop/mobile presets). Save the report and update the table above.

Notes: prioritize LCP (hero/media sizing), CLS (explicit sizes), and main-thread work (defer non-critical scripts). The UI respects reduced motion.

---

## Build, test, package

- Backend
   - Tests: `mvnw.cmd -q test`
   - Package: `mvnw.cmd -q clean package` → `backend/java/target/portfolio-0.0.5.jar`

---

## Contributing

PRs welcome. Keep changes focused, include tests where behavior changes, and follow existing style. For larger work, open an issue first.

## License

Unless stated otherwise, all rights reserved © Khova Krishna Pilato.
