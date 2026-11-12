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

A personal portfolio told as a short story instead of a CV. Eight reflections on what software owes the people who use it, each one backed by real work. There are no lists, tables, cards or pictures: only sentences, revealed one word at a time.

## The story

1. **Attention.** ATM Milano's notice workflow, from twenty minutes to two.
2. **Care.** Changing systems that are already running, at Intesa Sanpaolo and Fincons Group.
3. **Honesty.** Interfaces for real machines, at SEA Vision and for Bosch R&D.
4. **Privacy.** PixelPaper, and where a document should be read.
5. **Place.** BiMap and the difference between a register and a map.
6. **Memory.** Cherubini, a historical dictionary given new ways in.
7. **Awareness.** Two languages, flight simulation and the habit of looking twice.
8. **Craft.** Code written for the next person who reads it.

It opens with a name and ends with an invitation and three ways to make contact. All copy lives in `src/profile.ts`; professional facts come from the supplied profile, and the phone number is not published.

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

- **One viewport.** The page never scrolls. Scrolling, swiping or the arrow keys move through the story instead (`src/useStory.ts`).
- **Words, not drawings.** Every scene shares the same left edge and starting height, so only the words change.
- **Scroll-linked reveal.** Each scene appears word by word in reading order and leaves the same way, mapped linearly to the scroll position. The position glides after the hand and settles on a whole scene when the hand stops, so two scenes never share the screen.
- **A light that waits.** On devices with a mouse, a soft light follows the pointer and slowly brightens the words beneath it the longer it rests.
- **Evening palette.** Blue-black night, three tones of text and no accent colour; the reason for each is written at the top of `src/index.css`.
- **One typeface.** Newsreader, a reading serif with optical sizes, served locally.
- **Reduced motion.** With `prefers-reduced-motion`, scenes change without travel and the light stays still.
- **Fallbacks.** Forced-colours mode and print show plain text. Without JavaScript, a short profile with contact links is shown.

## Privacy and security

Assets and fonts are local. There are no analytics, tracking cookies, storage writes, embedded third-party widgets or contact forms. Contact links use email, LinkedIn and GitHub directly. Production builds inject a self-only Content Security Policy before the asset tags. Frame restrictions should additionally be set through HTTP headers where the hosting service supports them.

## Automation

One workflow, `.github/workflows/deploy.yml`, installs from the lockfile, lints and builds on every push and pull request, and deploys `dist` to GitHub Pages from `main`. Dependabot proposes npm and GitHub Actions updates daily.

## Rights

All rights reserved © Khova Krishna Pilato unless otherwise stated.
