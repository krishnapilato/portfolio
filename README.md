# Khova Krishna Pilato — Software, built with care

[![Deploy](https://github.com/krishnapilato/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/krishnapilato/portfolio/actions/workflows/deploy.yml)
[![Live site](https://img.shields.io/website?url=https%3A%2F%2Fkrishnapilato.github.io%2Fportfolio%2F&label=live%20site)](https://krishnapilato.github.io/portfolio/)
![Astro 7](https://img.shields.io/badge/Astro-7-bc52ee?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strictest-3178c6?logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![GSAP 3](https://img.shields.io/badge/GSAP-3-0ae448?logo=greensock&logoColor=white)
![No tracking](https://img.shields.io/badge/tracking-none-2ea44f)

[Live portfolio](https://krishnapilato.github.io/portfolio/)

A personal portfolio told as a short story instead of a CV. Eight principles, each stated in a few words and backed by real work. There are no lists, tables, cards or pictures: only sentences, revealed one word at a time.

## The story

1. **Twenty minutes became two.** ATM Milano's service notice workflow.
2. **Change what is already running.** Intesa Sanpaolo and Fincons Group.
3. **Show what is really happening.** SEA Vision and Capgemini Engineering.
4. **Keep the document where it is.** PixelPaper, an offline scanner.
5. **Give information a place.** BiMap, property records on a map.
6. **Keep old words usable.** Cherubini's Milanese dictionary.
7. **Look twice.** Bengaluru, Italy and flight simulation.
8. **Write for the next reader.** How I write code.

It opens with a name and ends with an invitation and three ways to make contact. Professional facts come from the supplied profile; the phone number is not published.

## Stack

Astro 7 on Vite 8, TypeScript in its strictest configuration, and GSAP for the animation clock. There is no UI framework: Astro renders every word to static HTML at build time, and one small module brings the story to life in the browser.

```sh
npm ci
npm run dev        # http://localhost:4321/portfolio/
npm run lint
npm run build      # astro check, then a static build in dist/
npm run preview
```

The deployment base is `/portfolio` for GitHub Pages; change `base` in `astro.config.ts` for another host path. `astro check` and ESLint use the TypeScript 6 API (installed as the `typescript` alias); the TypeScript 7 CLI is available as `@typescript/native`.

## Structure

```
src/
  content/profile.ts     all copy, validated at build time
  components/Scene.astro one scene: statement, sentences, facts, links
  components/Words.astro splits text into words for the reveal
  layouts/Base.astro     document head and metadata
  pages/index.astro      the story and its controls
  scripts/story.ts       the scroll engine and the pointer light
  styles/tokens.css      colours, type and spacing, each with its reason
  styles/base.css        mobile-first layout
```

## Design and motion

- **Swiss and centred.** Every scene is one centred block on a single axis: scene number, statement, a short steel-blue rule, two sentences and a line of facts.
- **Mobile first.** Base styles are the phone's; wider screens only enlarge type and space. Every scene fits one viewport down to 375×640 and 800×420.
- **One viewport.** With scripts on, the page never scrolls. Scrolling, swiping or the arrow keys move through the story instead.
- **Scroll-linked reveal.** Each scene appears word by word in reading order and leaves the same way, mapped linearly to the scroll position. Between two scenes there is a moment of empty paper, and when the hand stops the story settles on a whole scene.
- **A light that waits.** On devices with a mouse, a soft light follows the pointer and slowly deepens the ink of the words beneath it the longer it rests.
- **Palette and type.** Neutral white paper, three tones of ink and one steel-blue accent that marks structure only. One grotesque, Inter Tight, in three weights; hierarchy comes from size and spacing. Reasons are written in `src/styles/tokens.css`.
- **Without scripts** the page is a normal document with every scene in order. Reduced motion removes travel and easing; forced-colours mode and print show plain text.

## Security

The site is static, but it is built as if it were not:

- **Validated content.** `src/content/profile.ts` parses all copy with Zod at build time. Text containing `<` or `>` is refused, ids must be plain slugs, and every link must be `https` to an allowed host with no credentials. Anything else fails the build.
- **No HTML sinks.** Astro escapes every expression. ESLint forbids `set:html`, inline scripts, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` and `javascript:` URLs.
- **Untrusted input is never rendered.** The URL fragment is only compared against the known scene ids; numeric attributes are checked before use; the copy button writes a validated address to the clipboard and nothing back to the page.
- **Content Security Policy.** Every build carries a strict policy: `default-src 'none'`, scripts and styles only from the site itself with Astro-generated SHA-384 hashes, no frames, objects, workers or network requests, `base-uri 'none'`, `form-action 'none'`, and Trusted Types enforced so no script can create HTML.
- **Links.** External links use `rel="noopener noreferrer"` and the page sends no referrer.
- **Privacy.** Fonts and assets are served locally. There are no analytics, cookies, storage writes, third-party requests or forms.

GitHub Pages cannot set HTTP headers, so protections that only work as headers (such as `frame-ancestors`) need a host that supports them.

## Automation

One workflow, `.github/workflows/deploy.yml`, installs from the lockfile, lints and builds (including `astro check`) on every push and pull request, and deploys `dist` to GitHub Pages from `main`. Dependabot proposes npm and GitHub Actions updates daily.

## Rights

All rights reserved © Khova Krishna Pilato unless otherwise stated.
