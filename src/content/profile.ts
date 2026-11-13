import { z } from "astro/zod";

/*
  Every piece of copy on the site lives here and is validated when the site is built.
  A link must be https and point to an allowed host; an id must be a plain slug. Anything else fails the build,
  so no unexpected URL, scheme or markup can reach the page.
*/

const allowedHosts = new Set(["github.com", "www.linkedin.com", "krishnapilato.github.io"]);

const safeUrl = z.url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && allowedHosts.has(url.hostname) && url.username === "" && url.password === "";
}, "Links must be https and point to an allowed host.");

// Copy is plain text. Angle brackets are refused so markup can never be mistaken for content.
const plainText = z.string().trim().min(1).max(400).regex(/^[^<>]*$/, "Copy must be plain text.");

const link = z.object({ label: plainText.max(40), href: safeUrl }).strict();

const scene = z.object({
  id: z.string().regex(/^[a-z][a-z-]{1,23}$/, "Ids are short lowercase slugs."),
  title: plainText.max(60),
  text: z.array(plainText).min(1).max(3),
  note: plainText.max(120).optional(),
  links: z.array(link).max(2).optional(),
}).strict();

const person = z.object({
  name: plainText.max(60),
  role: plainText.max(80),
  email: z.email().max(80),
  linkedin: safeUrl,
  github: safeUrl,
}).strict();

const story = z.object({ person, scenes: z.array(scene).min(2).max(16) }).strict()
  .refine(({ scenes }) => new Set(scenes.map(item => item.id)).size === scenes.length, "Scene ids must be unique.");

export type Scene = z.infer<typeof scene>;

export const { person: profile, scenes } = story.parse({
  person: {
    name: "Khova Krishna Pilato",
    role: "Full stack Java developer",
    email: "krishnak.pilato@gmail.com",
    linkedin: "https://www.linkedin.com/in/khovakrishnapilato",
    github: "https://github.com/krishnapilato",
  },
  scenes: [
    {
      id: "start", title: "Khova Krishna Pilato",
      text: ["Full stack Java developer in Pavia, Italy.", "I build software people rely on every day, and I build it with care."],
    },
    {
      id: "attention", title: "Twenty minutes became two.",
      text: ["At ATM Milano I joined the drafting, review, approval and publication of service notices into one application.", "What it saves is not time. It is attention."],
      note: "ATM Milano, since 2026. C#, .NET 8 and SQL Server.",
    },
    {
      id: "care", title: "Change what is already running.",
      text: ["Banking at Intesa Sanpaolo, insurance at Fincons Group: systems that could not stop while I moved them forward.", "Read first. Then change gently."],
      note: "Intesa Sanpaolo and Fincons Group, 2024 to 2025.",
    },
    {
      id: "honesty", title: "Show what is really happening.",
      text: ["Interfaces for pharmaceutical packaging lines at SEA Vision, and for Bosch machines at Capgemini.", "A screen is only as honest as the data behind it."],
      note: "SEA Vision and Capgemini Engineering, 2022 to 2026.",
    },
    {
      id: "privacy", title: "Keep the document where it is.",
      text: ["PixelPaper reads a page on the phone itself, even offline.", "Privacy begins as an architectural decision."],
      note: "Personal project. Flutter and Google ML Kit.",
      links: [{ label: "PixelPaper on GitHub", href: "https://github.com/krishnapilato/pixelpaper" }],
    },
    {
      id: "place", title: "Give information a place.",
      text: ["BiMap sets Italian cadastral and heritage records on a map.", "A register says a property exists. A map shows where it stands."],
      note: "Personal project. Angular, Spring Boot and Leaflet.",
      links: [{ label: "BiMap on GitHub", href: "https://github.com/krishnapilato/bimap" }],
    },
    {
      id: "memory", title: "Keep old words usable.",
      text: ["With Stefano Pilato I brought 2,307 entries of Cherubini’s Milanese dictionary to the web and offline, from one source of data."],
      note: "React, TypeScript, JavaFX and SQLite.",
      links: [
        { label: "Open the dictionary", href: "https://krishnapilato.github.io/cherubini-digital-edition/" },
        { label: "Source on GitHub", href: "https://github.com/krishnapilato/cherubini-digital-edition" },
      ],
    },
    {
      id: "awareness", title: "Look twice.",
      text: ["Born in Bengaluru, raised in Italy.", "Flight simulation taught me to prepare, stay aware and decide deliberately."],
      note: "Italian and English.",
    },
    {
      id: "craft", title: "Write for the next reader.",
      text: ["A clear name. A meaningful test. A written decision.", "Code is a conversation with whoever opens it next."],
      note: "Java, Spring Boot, Angular, TypeScript and SQL.",
    },
    {
      id: "contact", title: "Let’s talk.",
      text: ["Open to full stack Java and backend roles, in Italy and internationally."],
    },
  ],
});
