# FAIR COPY — the portfolio frontend

Khova Krishna Pilato's portfolio, set as a small printed book. Every
complicated thing (a stack, a system, a method) is lifted out of the
sentence into a footnote, so the page reads plainly and the detail stays
exact in the notes. React 19, TypeScript, Vite 8 and GSAP 3. No canvas,
no WebGL, no images.

See `DESIGN.md` for the concept and the decision log.

## Run

```sh
cd frontend/react-app
npm ci                 # or: npm install
npm run dev            # http://localhost:5173/portfolio/
npm run build          # dist/, prerendered and checked (see below)
npm run preview        # serves dist/ at http://localhost:4173/portfolio/
npm run lint
```

Node 20.19+ or 22.12+ (Vite 8). TypeScript 7 builds; the TypeScript 6 API
is aliased for ESLint.

The site lives under `/portfolio/` (the GitHub Pages path), in dev too; the
dev server redirects `/` there. Opening `dist/index.html` straight from
disk does not work, because module scripts and the `/portfolio/` paths need
a server: use `npm run preview`.

**No animation?** The site follows the system's reduced-motion setting and
then shows the finished page with only gentle fades. On Windows that is
Settings → Accessibility → Visual effects → **Animation effects**; on macOS,
System Settings → Accessibility → Display → **Reduce motion**.

## Build

`npm run build` runs, in order:

1. `tsc -b`: type check.
2. `vite build`: the client bundle (React and GSAP in their own chunks).
3. `vite build --ssr src/entry-server.tsx`: a server build of the same app.
   Rendering it runs `src/content/validate.ts`, which fails the build if an
   edit's words do not pair up, an index entry cites a page that does not
   contain its term, or a contact link is malformed.
4. `scripts/prerender.mjs`: renders the whole page into `dist/index.html`
   and inlines the stylesheet, so every word paints before any JavaScript
   runs and the page reads completely without it.
5. `scripts/check-dist.mjs`: reads the finished page as a visitor would and
   fails the build if aviation appears outside "Away from the desk" (or in
   any heading), if any of the five contacts is missing or wrong, or if the
   page mentions a subject that must stay private. That last list is kept
   out of the repository on purpose: put one regular expression per line in
   a git-ignored `.private-terms` file, or in a `PRIVATE_TERMS` secret for
   CI. Without it, that one scan is skipped and the build says so.

## Where things are

- `src/content/`: every word on the page (`copy.ts`), page numbers
  (`folios.ts`), the back-of-book index (`indexTerms.ts`) and the build-time
  checks (`validate.ts`).
- `src/sections/`: one component per page or chapter, each with its own
  choreography.
- `src/motion/`: the GSAP vocabulary: line reveals, the edit, the pencil
  marks and rules, registration parallax, cuts (in-page jumps), the calm
  fades for reduced motion, and `useSection`, the only way a section
  animates.
- `src/styles/`: tokens, base, one sheet per section, and `motion.css`,
  which holds every state that exists only while motion is on.
- `scripts/fonts.py`: how the Newsreader subsets in `public/fonts/` were
  instanced.

## Deploy

Pushes to `main` build this folder and publish `dist/` to GitHub Pages
under `/portfolio/` (`.github/workflows/github-actions.yml`). Nothing here
calls a backend; the Spring Boot API in `backend/java` is independent.
