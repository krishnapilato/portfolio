## Krishna Pilato — Portfolio (Angular 20, SSR)

A modern, performant personal portfolio built with Angular 20 and Server-Side Rendering. The UI uses a refined glassmorphism system, a lightweight aurora/spotlight background, and purposeful animations to highlight projects and experience without sacrificing performance or accessibility.

This repository contains the frontend application under `frontend/angular` and is designed for production deployments with SSR.

## Highlights

- Angular 20, standalone components, production configuration by default
- Fixed glass header with active-section tracking and scroll progress
- Hero with liquid-glass chips and a continuous, accessible tech ticker
- About banner with portrait ring/glow, feature cards, skills toolbox, and horizontal milestones rail
- Projects grid with effort-based responsive spans and dense packing
- Contact form powered by EmailJS, with visible status and error handling
- Dismissible WIP banner persisted via localStorage
- Minimal glass footer showing version and release date

## Architecture and UX

- Application shell: the header, scroll progress, global background (aurora + spotlight + film grain) and footer are rendered by the root component. Spotlight position is throttled with requestAnimationFrame.
- Navigation: IntersectionObserver updates the active menu state as the user scrolls; hash changes are synchronized for deep links.
- Animations: AOS is loaded from CDN with deferred init and reduced-motion friendly settings. Animations slow down instead of stopping when the user prefers reduced motion.
- Accessibility: focus-visible outlines, aria-live regions for ephemeral messages, external links hardened with `rel="noopener noreferrer"`, and decorative visuals hidden from assistive tech.

## Tech Stack

- Angular 20 (standalone components, application builder with SSR)
- AOS (Animate On Scroll) via CDN
- Font Awesome via CDN
- EmailJS for contact form delivery

## Prerequisites

- Node.js 18 or later
- npm 9 or later

## Local Development

```cmd
npm install
npm start
```

Then open http://localhost:4200/.

## Production Build

Build the SSR-enabled bundle:

```cmd
npm run build
```

Artifacts will be emitted to `dist/angular/` (both browser and server bundles).

To serve the SSR build locally:

```cmd
npm run serve:ssr:angular
```

This starts a Node.js server that renders routes on the server and streams HTML to the client.

## Configuration

### EmailJS
The contact form uses EmailJS. Replace the service ID, template ID, and public key in `src/app/contact/contact.component.ts` with your own values.

For production, consider externalizing these values to environment files or an injected configuration to avoid hardcoding secrets. Public keys must remain public by EmailJS design, but service and template identifiers should be treated with care.

### Version and Release Information
The footer displays the application version and release date. Update these in the root component (`src/app/app.component.ts` and corresponding template) when you cut a new release.

### Third-Party Assets
- AOS and Font Awesome are loaded from CDNs using `preconnect`/`preload` to minimize blocking. If your deployment environment restricts external CDNs, self-host these assets and update `src/index.html` accordingly.

## Performance Notes

- CDN `preconnect` and stylesheet `preload` minimize initial render blocking for iconography
- AOS script is loaded with `defer` and initialized after `DOMContentLoaded`
- Frequent events (mousemove for spotlight) are throttled with requestAnimationFrame
- Images include explicit width/height and decoding hints to reduce CLS and improve LCP
- Global spacing and styles are tuned to avoid layout thrash across sections

The Angular production configuration enables output hashing and size budgets. Review `angular.json` for thresholds and adjust as needed for your deployment constraints.

## Accessibility

- Motion preferences respected via `prefers-reduced-motion` with slowed, not removed, marquee/ticker animations
- Live regions for transient messages (e.g., WIP banner, form submission status)
- Keyboard focus is clearly visible; interactive glass components maintain sufficient contrast

## Project Structure (selected)

```
src/
	index.html              # Root HTML; CDN links for AOS and Font Awesome
	styles.scss             # Global tokens, glass system, background, spacing
	app/
		app.component.*       # Shell (header, banner, sections, footer)
		hero/                 # Hero layout, ticker, chips
		about-me/             # Banner, features, toolbox, milestones
		projects/             # Grid and card designs
		contact/              # Info + EmailJS form
```

## Testing

```cmd
npm test
```

This runs unit tests with Karma/Jasmine.

## Deployment

Use the SSR output for best performance and SEO. After `npm run build`, deploy the contents of `dist/angular` alongside the Node entry `server/server.mjs` and run `npm run serve:ssr:angular` (or integrate the Node bootstrapping into your platform's process manager). Ensure outbound network access for EmailJS if the contact form is enabled.

For static hosting without SSR, host only the browser build, understanding that performance and SEO characteristics may differ.

## Maintenance

- Keep Angular and build tooling up to date for security and performance improvements
- Periodically audit third-party assets and remove unused dependencies
- Review Lighthouse scores after significant UI changes; pay attention to LCP, CLS, and main-thread work

---

Copyright © 2025 Khova Krishna Pilato
