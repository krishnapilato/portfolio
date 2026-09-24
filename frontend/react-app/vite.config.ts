import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { BEATS, CONTACTS } from "./src/content/beats";

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
      const sections = BEATS.map((beat) => {
        const links = (beat.links ?? [])
          .map((link) => `<li><a href="${escape(link.href)}">${escape(link.label)}${link.value ? `: ${escape(link.value)}` : ""}</a></li>`)
          .join("");
        return `<section><p>${escape(beat.kicker)}</p><h2>${escape(beat.title)}</h2><p>${escape(beat.body)}</p>${beat.meta ? `<p>${escape(beat.meta)}</p>` : ""}${links ? `<ul>${links}</ul>` : ""}</section>`;
      }).join("");
      const contacts = CONTACTS.map((c) => `<li><a href="${escape(c.href)}">${escape(c.label)}: ${escape(c.value ?? c.href)}</a></li>`).join("");
      const article = `<article style="padding:3rem 1.5rem;max-width:40rem;font-family:system-ui,sans-serif;line-height:1.6"><h1 style="font-weight:500">Khova Krishna Pilato</h1><p>Full Stack Java Developer. This portfolio is a scroll-driven 3D film and needs JavaScript; the words and the contacts are here regardless.</p>${sections}<h2>Contact</h2><ul>${contacts}</ul></article>`;
      return html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${article}</noscript>`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // The React Compiler memoises the DOM overlay automatically, so scroll-driven
  // state changes never cascade into re-renders of untouched subtrees.
  plugins: [react({ compiler: true }), noscriptArticle()],
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
            { name: "three", test: /node_modules[\\/]three[\\/]/ },
            { name: "r3f", test: /node_modules[\\/](@react-three|postprocessing|n8ao|maath|troika|zustand|suspend-react|its-fine|use-sync-external-store)[\\/]/ },
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
});
