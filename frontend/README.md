# Khova Krishna Pilato — Software, built with care

A personal portfolio written as a short essay instead of a CV. Six reflections on what software owes the people who use it, each one backed by real work. There are no lists, tables, cards or illustrations: only sentences, and the space around them.

## The story

1. **Time.** ATM Milano’s notice workflow, from twenty minutes to two.
2. **Privacy.** PixelPaper, and why this site collects nothing.
3. **Place.** BiMap and the difference between a register and a map.
4. **Trust.** The full professional path since 2021, told as prose.
5. **Doubt.** Aviation, checklists, background and education.
6. **Craft.** The toolkit, in four sentences.

The story ends with an invitation and three ways to make contact. All copy lives in `src/profile.ts`; professional facts come from the supplied profile, and the phone number is not published. `src/App.tsx` only lays the story out.

## Design decisions

Every choice is written down in the comment at the top of `src/index.css`. In short:

- **Light only.** The page is paper (`#f5f2ea`, less glare than white over a long read) and ink (`#1b1916`). There is no dark theme and no accent colour: nothing is decoration, so nothing needs a colour of its own.
- **Two typefaces, both local system fonts.** Georgia is the voice, used for every reflection and paragraph. Cascadia Code is the record, used for names, dates and tools: the part a reader can verify.
- **Space as punctuation.** Each statement lands on an almost empty screen, and three single sentences get a whole viewport to themselves before the next chapter begins.
- **Fluid sizes.** Type and spacing scale continuously from a 320px phone to a wide desktop; one breakpoint (900px) only moves the reading column beside the statement.

## Motion and attention

- **Soft reveals.** Statements arrive word by word, from blurred and transparent to sharp (GSAP SplitText, with accessible labels). The three pauses are tied to scrolling, so they surface at reading pace.
- **Ink follows attention.** Display text is faded ink until attention reaches it (`src/light.ts`). Attention is the pointer, the element holding keyboard focus after Tab, or the reading zone of the screen when scrolling by touch or with the keyboard. The effect is a 2D radial gradient clipped to the text; there is no WebGL or canvas.
- **Reduced motion.** With `prefers-reduced-motion`, the fades remain and all travel, blur and easing of the attention point are removed.
- **Fallbacks.** Focus inside a section shows its text immediately. Forced-colours mode and print use plain text. Without JavaScript, a short profile with contact links is shown.

## Development

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

The deployment base remains `/portfolio/` for GitHub Pages. Change `base` in `vite.config.ts` for a different host path. The TypeScript 7 CLI is installed as `@typescript/native`; the `typescript` alias supplies the TypeScript 6 API needed by ESLint, following [Microsoft’s compatibility setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0).

## Privacy and security

Assets and fonts are local. There are no analytics, tracking cookies, storage writes, embedded third-party widgets or contact forms. Contact links use email, LinkedIn and GitHub directly. Production builds inject a self-only CSP before asset tags; the attention effect sets CSS custom properties from script, which that policy allows. Development uses Vite’s normal script and style injection; it does not weaken the production policy. Frame restrictions should additionally be set through HTTP headers where the hosting service supports them.
