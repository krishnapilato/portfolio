## Portfolio — Angular SSR frontend + Spring Boot API

![Java](https://badgen.net/badge/Java/24.0.2/blue?icon=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0--M1-brightgreen?style=flat&logo=spring-boot)
![Angular](https://img.shields.io/badge/Angular-20.1.6-red?style=flat&logo=angular)
![MySQL](https://img.shields.io/badge/MySQL-9.4.0-blue?style=flat&logo=mysql)
![Version](https://img.shields.io/badge/Version-0.0.5-blue?style=flat)
[![CI](https://github.com/krishnapilato/portfolio/actions/workflows/github-actions.yml/badge.svg)](https://github.com/krishnapilato/portfolio/actions)

Monorepo hosting a production-ready Angular 20 (SSR) frontend and a Spring Boot 4 API. Clean UX, fast first paint, email contact flow, OpenAPI docs, and containerized local dev.

- Live site (frontend): https://krishnapilato.github.io/portfolio
- Demo API (backend): https://khovakrishnapilato-backend.eu-south-1.elasticbeanstalk.com  
   *(Accessible only via AWS VPN)*

### Layout

- `frontend/angular` — Angular 20 app with SSR; EmailJS-powered contact form
- `backend/java` — Spring Boot 4 API (JWT, OpenAPI, MySQL), Docker-compose for dev

For deep details, see the module READMEs:
- Frontend: `frontend/angular/README.md`
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

### Frontend (Angular SSR)

Prereqs: Node 18+, npm 9+.

Dev server:

```cmd
cd frontend\angular
npm install
npm start
```

SSR build and serve locally:

```cmd
npm run build
npm run serve:ssr:angular
```

---

## Configuration

- Backend environment (DB, SMTP, ports): see `backend/java/README.md` → Configuration. Common vars: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`.
- Frontend contact form uses EmailJS. Replace service/template IDs and public key in `src/app/contact/contact.component.ts` or externalize via environment injection. See `frontend/angular/README.md`.

---

## Lighthouse

Current scores (last run: YYYY‑MM‑DD):

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

- Frontend
   - Unit tests: `npm test`
   - Build (SSR): `npm run build`

---

## Contributing

PRs welcome. Keep changes focused, include tests where behavior changes, and follow existing style. For larger work, open an issue first.

## License

This project is open-source under the MIT License. See `LICENSE` for details.