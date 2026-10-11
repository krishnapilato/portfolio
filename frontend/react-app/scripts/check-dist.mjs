/**
 * The last step of the build: reads the finished page the way a visitor
 * would (its text, its metadata, its links) and fails the build if the
 * page says something it must not, sends a contact to the wrong place, or
 * lets the aviation section leak into the rest of the book.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const problems = [];

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENTITIES[e] ?? m),
  );

/** What a reader, a screen reader or a search engine can see in a piece of HTML. */
function readable(html) {
  const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const attrs = [...html.matchAll(/\s(?:content|aria-label|alt|title)="([^"]*)"/g)].map((m) => m[1]);
  const text = html
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
  return decode([text, ...attrs, ...data].join(" ")).replace(/\s+/g, " ");
}

const section = (html, id) => html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0] ?? "";

// Subjects that must never be on the page. The list itself is private, so
// it is not in the repository: it comes from the PRIVATE_TERMS environment
// variable (a CI secret) or a git-ignored .private-terms file, one
// case-insensitive regular expression per line.
const privateFile = join(dirname(fileURLToPath(import.meta.url)), "..", ".private-terms");
const privateSource = process.env.PRIVATE_TERMS ?? (existsSync(privateFile) ? readFileSync(privateFile, "utf8") : "");
const PRIVATE = privateSource
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => new RegExp(line, "i"));
// The aviation section is plain content in one place (and the index points to it).
const AVIATION = [
  /aviat/i, /aircraft/i, /airplane/i, /aeroplane/i, /\bflight/i, /\bfl(?:y|ew|ying|own)\b/i, /pilot/i, /cockpit/i,
  /runway/i, /airport/i, /take-?offs?\b/i, /\blandings?\b/i, /altitude/i, /\bA380\b/, /airbus/i, /cessna/i,
  /\btrim\b/i, /simulator/i, /logbook/i, /airfield/i, /venegono/i, /\baero\b/i, /\bclimb/i, /\bhorizon/i,
];
const MACHINE = [/\bAI\b/, /artificial intelligence/i, /\bGPT\b/i, /\bClaude\b/, /language model/i, /attitude indicator/i, /\bWebGL\b/i, /three\.js/i];
const CONTACTS = [
  "mailto:krishnak.pilato@gmail.com",
  "tel:+393382965483",
  "https://www.linkedin.com/in/khovakrishnapilato",
  "https://github.com/krishnapilato",
  "https://www.instagram.com/khovakrishna.pilato",
];

function scan(label, text, patterns, why) {
  for (const re of patterns) {
    const hit = text.match(re);
    if (hit) {
      const at = text.indexOf(hit[0]);
      problems.push(`${label}: ${why} "${hit[0]}" in "…${text.slice(Math.max(0, at - 40), at + 40)}…"`);
    }
  }
}

const page = readFileSync(join(dist, "index.html"), "utf8");
const notFound = readFileSync(join(dist, "404.html"), "utf8");
const whole = readable(page);

scan("index.html", whole, PRIVATE, "private subject");
scan("404.html", readable(notFound), PRIVATE, "private subject");
scan("index.html", whole, MACHINE, "does not belong on the page:");

// Aviation: allowed inside "Away from the desk" and as plain index references; nowhere else.
const rest = readable(page.replace(section(page, "away"), " ").replace(section(page, "index"), " "));
scan("outside #away", rest, AVIATION, "aviation word");
scan("404.html", readable(notFound), AVIATION, "aviation word");
for (const heading of page.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)) scan("heading", readable(heading[1]), AVIATION, "aviation word in a heading:");

// Every contact, exactly, in the correspondence.
const correspondence = section(page, "correspondence");
for (const href of CONTACTS) {
  if (!correspondence.includes(`href="${href}"`)) problems.push(`#correspondence: missing contact link ${href}`);
}
if (!section(page, "title")) problems.push("prerender: no title page in dist/index.html");
if (/<!--app-->/.test(page)) problems.push("prerender: the <!--app--> placeholder is still there");

if (problems.length) {
  console.error(`check-dist: ${problems.length} problem(s)\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const privacy = PRIVATE.length ? `${PRIVATE.length} private terms` : "private terms not configured, skipped";
console.log(`check-dist: ok (${whole.split(" ").length} words read, ${privacy}, index.html ${kb(Buffer.byteLength(page))})`);
