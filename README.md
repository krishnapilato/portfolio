# Khova Krishna Pilato — Six notes

A personal portfolio in six chapters. No header, footer, cards, illustrations or decorative graphics. A chapter occupies the viewport; a small numbered index stays within reach. The professional facts come from the supplied profile, including ComunicatiNET’s reduction in notice processing time from 20 minutes to 2.

[Live portfolio](https://krishnapilato.github.io/portfolio/)

## The experience

1. **Threshold** — identity and the people who use the software.
2. **Two latitudes** — born in Bengaluru, raised in Italy.
3. **The architecture of restraint** — understand complexity before adding to it.
4. **Human in the loop** — automation, preparation and responsibility.
5. **Systems in service** — ATM Milano, SEA Vision, Intesa Sanpaolo, Capgemini, BiMap and PixelPaper.
6. **Final approach** — working principles and direct contact.

Wheel, vertical swipe, arrow keys, Page Up/Down and Space move one chapter at a time. Shift+Space goes back; Home and End reach the first and last chapters. The index links directly to any chapter. A transition lock and wheel gesture threshold prevent inertia from skipping chapters. Outgoing paragraphs dissolve, pause for half a second, then the incoming text appears. Transitions stay animated regardless of the system reduced-motion preference.

Selected work uses accessible tabs, including Left/Right and Home/End keyboard controls. Inactive chapters are inert and excluded from the accessibility tree. Navigation announces the current chapter; focus moves to the incoming heading if it would otherwise remain in hidden content. Clipboard failures leave the email link usable and report a readable fallback.

Without JavaScript, the page is a scrollable document containing every chapter and every project. The single-viewport layout only activates after initialization. Print restores the full document. A near-white background and neutral charcoal text stay light under either system theme, using semantic colors and solid backgrounds; no blend modes, gradient text or masks. Dark Reader compatibility is a design consideration, not a claim of extension testing.

## Development

Astro, TypeScript and GSAP. Static HTML, one local Inter Tight font, no UI framework, no remote fonts or scripts. The production base is `/portfolio`.

```sh
npm ci
npm run dev            # immediate local development at /portfolio/
npm run lint
npm run check
npm run build
npm run preview
npm run verify         # complete release gates
npm run check:updates  # optional dependency freshness report
```

Before running browser gates locally, install Chromium with `npx playwright install chromium` (Linux: `npx playwright install --with-deps chromium`). Standalone `npm run test:e2e` and `npm run lighthouse` require a current build. `verify` builds automatically. Dependency freshness does not block local development or deployment; Dependabot proposes updates daily.

## Source

- `src/content/profile.ts`: validated English copy and project details.
- `src/components/Scene.astro`: semantic chapter, project tabs and contact markup.
- `src/pages/index.astro`: six chapters and the numbered index.
- `src/scripts/story.ts`: transitions, normalized input, focus, tabs and clipboard.
- `src/styles/tokens.css`: local font, light semantic colors.
- `src/styles/base.css`: responsive composition, progressive enhancement and print.
- `src/layouts/Base.astro`: metadata and document shell.

## Release gates

The GitHub Actions workflow runs `npm run gates` on pull requests and pushes to `main`. Deployment depends on every gate passing:

- ESLint with SonarJS, zero warnings; Knip for unused code and dependencies.
- Astro and TypeScript checks, then the static production build.
- Existing size limits: HTML 4 kB, CSS 3 kB and JavaScript 30 kB (Brotli), fonts 50 kB uncompressed.
- Playwright on production output in desktop and mobile Chromium: input, inertia, deep links, tabs, focus, contacts, clipboard fallback, animation with reduced motion requested, no-JavaScript reading, metadata and runtime errors. Every chapter and work panel is checked with Axe under both light and dark system preferences. Layout checks cover 320×568 and 375×640 portrait, plus 667×375 and 800×420 landscape.
- Lighthouse, three runs: median performance at least 90; accessibility, best practices and SEO 100.

Automated checks are not an accessibility certification. Real-device reading, screen-reader behaviour and Dark Reader still merit manual review. Chromium emulation does not cover Safari or Firefox. Required checks for merging depend on repository branch protection; this workflow blocks deployment on failure.

## Security and privacy

Content is validated at build time using Zod: plain text, unique slug ids, validated email, and HTTPS links to approved hosts without credentials. Astro escapes text; ESLint forbids unsafe HTML sinks and dynamic code. Hashes are matched against known chapters, never rendered as markup.

Production builds carry a restrictive CSP with Astro-generated script/style hashes, same-origin assets, no frames, workers or objects, and Trusted Types enforced. External links use `noopener noreferrer`; the document sends no referrer. Fonts and scripts are local. There are no analytics, cookies, storage writes or forms. GitHub Pages cannot set protections that require HTTP headers, such as `frame-ancestors`.

## Rights

All rights reserved © Khova Krishna Pilato unless otherwise stated.
