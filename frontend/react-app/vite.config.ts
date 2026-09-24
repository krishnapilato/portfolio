import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { BEATS } from "./src/content/beats";
import { KEYFRAMES } from "./src/scene/keyframes";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Writes the whole ten-beat article into <noscript> at build time, so the
 * site without JavaScript is a readable document with the same words and
 * the same five contact links, and crawlers see the text without running
 * the renderer.
 */
function noscriptArticle(): Plugin {
  return {
    name: "attitude-noscript-article",
    transformIndexHtml(html) {
      const linked = (text: string, links?: Record<string, string>) => {
        let out = escape(text);
        for (const [label, href] of Object.entries(links ?? {})) {
          out = out.replace(escape(label), `<a href="${escape(href)}">${escape(label)}</a>`);
        }
        return out;
      };
      const sections = BEATS.map((beat) => {
        const body = Array.isArray(beat.body)
          ? `<dl>${beat.body.map((row) => `<dt>${escape(row.term)}</dt><dd>${escape(row.detail)}</dd>`).join("")}</dl>`
          : `<p>${escape(beat.body)}</p>`;
        const links = (beat.links ?? [])
          .map((link) => `<li><a href="${escape(link.href)}">${escape(link.label)}${link.value ? `: ${escape(link.value)}` : ""}</a></li>`)
          .join("");
        return `<section><p>${escape(beat.kicker)}</p><h2>${linked(beat.title, beat.titleLinks)}</h2>${body}${beat.meta ? `<p>${linked(beat.meta, beat.metaLink)}</p>` : ""}${links ? `<ul>${links}</ul>` : ""}</section>`;
      }).join("");
      const article = `<article style="padding:3rem 1.5rem;max-width:40rem;font-family:system-ui,sans-serif;line-height:1.6"><h1 style="font-weight:500">Khova Krishna Pilato</h1><p>Full Stack Java Developer. This portfolio is a scroll-driven 3D film and needs JavaScript; the words and the contacts are here regardless.</p>${sections}</article>`;
      return html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${article}</noscript>`);
    },
  };
}

/**
 * Writes the first beat's words into the root element at build time, with
 * the spacer tracks that give the document its length. The browser paints
 * the opening words from the HTML alone, before any script has run, and
 * React's first render replaces the same markup in place: nothing moves.
 */
function firstBeat(): Plugin {
  return {
    name: "attitude-first-beat",
    transformIndexHtml(html) {
      const beat = BEATS[0];
      const tracks = KEYFRAMES.map((k) => `<div class="track" data-track="${escape(k.id)}" style="--weight:${k.weight}"></div>`).join("");
      const block =
        `<div class="beat__block" data-lenis-prevent data-readable="true" style="opacity:1">` +
        `<h1 class="beat__kicker"><span class="beat__index" aria-hidden="true">01</span>${escape(beat.kicker)}</h1>` +
        `<h2 class="beat__title" id="${escape(beat.id)}-title" tabindex="-1">${escape(beat.title)}</h2>` +
        `<p class="beat__body">${escape(String(beat.body))}</p>` +
        (beat.hint ? `<p class="beat__meta beat__hint">${escape(beat.hint)}</p>` : "") +
        `</div>`;
      const markup =
        `<main class="film"><div class="tracks" aria-hidden="true">${tracks}</div>` +
        `<div class="beats"><section class="beat" id="${escape(beat.id)}" data-beat="${escape(beat.id)}" data-away="false" aria-labelledby="${escape(beat.id)}-title">${block}</section></div></main>`;
      return html.replace("<!--first-beat-->", markup);
    },
  };
}

/**
 * Inlines the one stylesheet into the HTML after the build, so the first
 * paint waits for no second request. Twelve kilobytes of CSS cost less than
 * a round trip on a phone.
 */
function inlineCss(): Plugin {
  return {
    name: "attitude-inline-css",
    apply: "build",
    writeBundle(options) {
      const dir = options.dir ?? "dist";
      const assets = join(dir, "assets");
      const css = readdirSync(assets).filter((f) => f.endsWith(".css"));
      if (css.length !== 1) return;
      const style = readFileSync(join(assets, css[0]), "utf8");
      const htmlPath = join(dir, "index.html");
      const html = readFileSync(htmlPath, "utf8");
      const link = new RegExp(`\\s*<link rel="stylesheet"[^>]*href="[^"]*${css[0].replace(".", "\\.")}"[^>]*>`);
      if (!link.test(html)) return;
      writeFileSync(htmlPath, html.replace(link, `\n    <style>${style}</style>`));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // The React Compiler memoises the DOM overlay automatically, so scroll-driven
  // state changes never cascade into re-renders of untouched subtrees.
  plugins: [react({ compiler: true }), noscriptArticle(), firstBeat(), inlineCss()],
  // Deployed to GitHub Pages as a project site: https://krishnapilato.github.io/portfolio/
  base: "/portfolio/",
  build: {
    target: "baseline-widely-available",
    // Fonts and generated assets stay as files so the HTML shell paints first.
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // Split the renderer from React so each is cached independently and
        // the two download in parallel; a three.js bump never busts the
        // React chunk and vice versa.
        codeSplitting: {
          groups: [
            // The store and the scroll driver are the entry's only vendor
            // code: their own small chunk, so the entry never has to reach
            // into the renderer chunk for them.
            // React, its JSX runtime and the scheduler win every tie: they are
            // needed for the first paint and must never land in the renderer chunk.
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: "vendor", test: /node_modules[\\/](zustand|lenis)[\\/]/, priority: 20 },
            { name: "three", test: /node_modules[\\/]three[\\/]/, priority: 10 },
            // zustand stays out: the store is in the entry, and one tiny import
            // must not drag the whole renderer chunk into the first load.
            { name: "r3f", test: /node_modules[\\/](@react-three|postprocessing|n8ao|maath|troika|suspend-react|its-fine)[\\/]/, priority: 5 },
          ],
        },
      },
    },
  },
});
