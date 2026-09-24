# ATTITUDE — the portfolio frontend

A scroll-driven cinematic portfolio: one procedurally machined attitude
indicator in a bench test fixture, ten beats of story, the horizon inside
never moves. React 19.3, react-three-fiber 9, three 0.186, Vite 8.

See `DESIGN.md` for the concept and the decision log.

## Run

```sh
npm install --legacy-peer-deps
npm run dev          # http://localhost:5173/portfolio/
npm run build        # dist/, deployed to GitHub Pages by the workflow
npm run preview      # serves dist/ at http://localhost:4173/portfolio/
npm run lint
```

Node 22+ (Vite 8). TypeScript 7 builds; the TypeScript 6 API is aliased for ESLint.

## Testing helpers

- `?tier=high|mid|low` forces the rendering tier.
- `#horizon … #contact` deep-link to a beat's hold point.
- `window.__timeline` exposes the store (progress, beat, tier, ready).
- Keyboard: J/K, arrows, page keys, Home, End; Escape stops a move.

## Deploy

Pushes to `main` build this folder and publish `dist/` to GitHub Pages under
`/portfolio/`. Nothing here calls a backend; the Spring Boot API in
`backend/java` is independent.
