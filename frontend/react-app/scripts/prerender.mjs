/**
 * Static first paint. After the client and server builds, this renders the
 * whole page to HTML once and writes it into dist/index.html, then inlines
 * the one stylesheet. The browser paints every word before a byte of
 * JavaScript runs; React then hydrates the same markup in place, and a
 * reader without JavaScript gets the complete page.
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssr = join(root, "dist-ssr");

const { render } = await import(pathToFileURL(join(ssr, "entry-server.js")).href);
const htmlPath = join(dist, "index.html");
let html = readFileSync(htmlPath, "utf8");

const markup = render();
if (!html.includes("<!--app-->")) throw new Error("index.html has no <!--app--> placeholder");
html = html.replace("<!--app-->", markup);

// Inline the stylesheet: a few kilobytes of CSS cost less than a round trip.
const assets = join(dist, "assets");
const sheets = readdirSync(assets).filter((f) => f.endsWith(".css"));
for (const sheet of sheets) {
  const link = new RegExp(`\\s*<link rel="stylesheet"[^>]*href="[^"]*${sheet.replace(/\./g, "\\.")}"[^>]*>`);
  if (!link.test(html)) continue;
  const css = readFileSync(join(assets, sheet), "utf8");
  html = html.replace(link, () => `\n    <style>${css}</style>`);
}

writeFileSync(htmlPath, html);
rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${Math.round(markup.length / 1024)} kB of markup, inlined ${sheets.length} stylesheet(s)`);
