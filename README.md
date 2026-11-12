# Khova Krishna Pilato — Software, built with care

[![Deploy](https://github.com/krishnapilato/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/krishnapilato/portfolio/actions/workflows/deploy.yml)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Fkrishnapilato.github.io%2Fportfolio%2F&label=live%20site)](https://krishnapilato.github.io/portfolio/)
![React 19](https://img.shields.io/badge/React-19-20232a?logo=react)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?logo=tailwindcss&logoColor=white)
![GSAP 3](https://img.shields.io/badge/GSAP-3-0ae448?logo=greensock&logoColor=white)
![No tracking](https://img.shields.io/badge/tracking-none-2ea44f)

[Live portfolio](https://krishnapilato.github.io/portfolio/)

A personal portfolio written as a short essay instead of a CV. Seven reflections on what software owes the people who use it, each one backed by real work. There are no lists, tables or cards: only sentences, and the space around them.

## The story

1. **Time.** ATM Milano's notice workflow, from twenty minutes to two.
2. **Privacy.** PixelPaper, and where a document should be read.
3. **Place.** BiMap and the difference between a register and a map.
4. **Words.** Cherubini, a historical dictionary given new ways in.
5. **Trust.** The full professional path since 2021, told as prose.
6. **Doubt.** Aviation, checklists, background and education.
7. **Craft.** Code written for the next person who reads it.

The story ends with an invitation and three ways to make contact. All copy lives in `src/profile.ts`; professional facts come from the supplied profile, and the phone number is not published. `src/App.tsx` only lays the story out.

## Stack

React 19, TypeScript 7, Vite 8, Tailwind CSS 4 and GSAP. The whole site is a static bundle with no backend.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

The deployment base is `/portfolio/` for GitHub Pages. Change `base` in `vite.config.ts` for a different host path. The TypeScript 7 CLI is installed as `@typescript/native`; the `typescript` alias supplies the TypeScript 6 API needed by ESLint, following [Microsoft's compatibility setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0).

## Design and motion

- **Light only.** The page is paper and ink, with no accent colour: nothing is decoration, so nothing needs a colour of its own.
- **One locally served typeface.** DM Sans, bundled with the site.
- **Ink follows attention.** Display text is faded ink until attention reaches it (`src/light.ts`): the pointer, or the reading zone of the screen when scrolling by touch or keyboard. The effect is a 2D radial gradient clipped to the text; there is no WebGL or canvas.
- **Scroll narrative.** `src/useScrollNarrative.ts` ties each reveal to scrolling, so statements surface at reading pace.
- **Reduced motion.** With `prefers-reduced-motion`, the fades remain and travel, blur and easing are removed.
- **Fallbacks.** Forced-colours mode and print use plain text. Without JavaScript, a short profile with contact links is shown.

## Privacy and security

Assets and fonts are local. There are no analytics, tracking cookies, storage writes, embedded third-party widgets or contact forms. Contact links use email, LinkedIn and GitHub directly. Production builds inject a self-only Content Security Policy before the asset tags. Frame restrictions should additionally be set through HTTP headers where the hosting service supports them.

## Automation

One workflow, `.github/workflows/deploy.yml`, installs from the lockfile, lints and builds on every push and pull request, and deploys `dist` to GitHub Pages from `main`. Dependabot proposes npm and GitHub Actions updates daily.

## Rights

All rights reserved © Khova Krishna Pilato unless otherwise stated.
