import { z } from "astro/zod";

const plain = z.string().trim().min(1).max(500).regex(/^[^<>]*$/, "Copy must be plain text.");
const slug = z.string().regex(/^[a-z][a-z-]{1,23}$/);
const hosts = new Set(["github.com", "www.linkedin.com", "krishnapilato.github.io"]);
const safeUrl = z.url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && hosts.has(url.hostname) && !url.username && !url.password;
}, "Links must use HTTPS and an allowed host.");
const link = z.object({ label: plain.max(40), href: safeUrl }).strict();
const chapter = z.object({
  id: slug, label: plain.max(40), title: plain.max(80),
  text: z.array(plain).min(1).max(3), note: plain.max(120),
}).strict();
const project = z.object({
  id: slug, label: plain.max(40), title: plain.max(80), context: plain.max(100),
  text: plain, outcome: plain.max(160), stack: plain.max(100), links: z.array(link).max(2).optional(),
}).strict();
const content = z.object({
  person: z.object({ name: plain.max(60), role: plain.max(80), email: z.email(), linkedin: safeUrl, github: safeUrl }).strict(),
  scenes: z.array(chapter).length(6), projects: z.array(project).length(5),
}).strict().refine(({ scenes, projects }) => new Set([...scenes, ...projects].map(item => item.id)).size === scenes.length + projects.length, "Ids must be unique.");
export type Scene = z.infer<typeof chapter>;

// Professional claims come from the supplied profile; reflections are personal copy, not credentials.
export const { person: profile, scenes, projects } = content.parse({
  person: {
    name: "Khova Krishna Pilato", role: "Full Stack Software Engineer", email: "krishnak.pilato@gmail.com",
    linkedin: "https://www.linkedin.com/in/khovakrishnapilato", github: "https://github.com/krishnapilato",
  },
  scenes: [
    {
      id: "start", label: "Threshold", title: "Khova Krishna Pilato",
      text: ["I build software that becomes part of someone’s working day.", "The interesting part is making it easier to trust, easier to use, and easier for the next person to change."],
      note: "Full Stack Software Engineer · Pavia, Italy",
    },
    {
      id: "latitudes", label: "Two latitudes", title: "More than one way to see.",
      text: ["I was born in Bengaluru and raised in Italy. Two places, neither a complete explanation of who I am.", "Moving between perspectives makes me slower to assume that my way is the obvious one. That is useful in software: the system that makes sense to its author still has to make sense to someone else."],
      note: "Born in Bengaluru. Raised in Italy. Building between perspectives.",
    },
    {
      id: "restraint", label: "The architecture of restraint", title: "Leave less to work around.",
      text: ["An extra step. A duplicated field. A workaround everyone has stopped questioning. Complexity often arrives quietly, then becomes somebody’s daily work.", "I like starting there. Understand the constraint, keep what earns its place, and remove what makes a simple task difficult. A smaller system is only better if it still does the whole job."],
      note: "Read the existing system before proposing the next one.",
    },
    {
      id: "judgment", label: "Human in the loop", title: "The judgment is still yours.",
      text: ["Flight simulation has made me appreciate the work that happens before anything moves: preparation, checks, and knowing what to do when the expected sequence breaks.", "I think about AI in software in much the same way. Generating code is useful. Deciding what should exist, checking it against real conditions, and taking responsibility for it remain the work."],
      note: "Automation can help with the task. It cannot own the decision.",
    },
    {
      id: "work", label: "Systems in service", title: "What that looks like in practice.",
      text: ["Different environments. The same concern: what does the person using this actually need?"], note: "Selected work · 2022—2026",
    },
    {
      id: "contact", label: "Final approach", title: "Something worth working on?",
      text: ["I care about the details that remain after delivery: a clear name, a useful test, a decision the next developer can understand.", "I’m open to full stack and Java backend opportunities in Italy and internationally. If that sounds like your kind of work, let’s talk."],
      note: "A conversation is a good place to start.",
    },
  ],
  projects: [
    {
      id: "atm", label: "ATM Milano", title: "Twenty minutes became two.", context: "Public transport · ComunicatiNET · 2026",
      text: "One application for drafting, reviewing and publishing service notices, including weekly bulletins and their PDF and TXT files. Alongside it, SQL analysis of punctuality and operational performance.",
      outcome: "Notice processing time reduced from 20 minutes to 2.", stack: "C# · .NET 10 · Blazor Server · SQL Server",
    },
    {
      id: "sea", label: "SEA Vision", title: "Make the machine legible.", context: "Pharmaceutical packaging · 2025—2026",
      text: "Machine configuration screens and real-time sensor views for pharmaceutical packaging equipment. Reusable components kept the interface consistent across a compliance-driven product.",
      outcome: "Configuration and monitoring brought into a consistent interface.", stack: "Angular 18 · Angular Material · Angular CDK",
    },
    {
      id: "intesa", label: "Intesa Sanpaolo", title: "Change a system people rely on.", context: "Banking · 2024—2025",
      text: "CRM features for operator tickets and backend logic for a B2B application. I contributed to the move from a monolith to microservices, integrating APIs as the application evolved.",
      outcome: "New services connected to existing banking workflows.", stack: "Java · Spring Boot · MongoDB · Angular",
    },
    {
      id: "capgemini", label: "Capgemini", title: "Start with what is happening.", context: "Energy & Bosch R&D · 2022—2024",
      text: "A read-only dashboard for a Bosch R&D project made machine sensor data, operating statistics and locations visible. In energy, I maintained billing functionality and investigated defects.",
      outcome: "Industrial telemetry made readable; billing behaviour maintained.", stack: "Java · Spring Boot · Angular · Oracle · GWT",
    },
    {
      id: "independent", label: "Independent", title: "An idea, all the way through.", context: "BiMap & PixelPaper · Personal projects",
      text: "BiMap gives Italian cadastral and heritage assets a place on a map. PixelPaper is an offline-first Android scanner with edge detection and OCR. Both let me follow a problem from architecture to delivery.",
      outcome: "Location gives records context. Local processing keeps documents on the device.", stack: "Angular · Spring Boot · Flutter · Google ML Kit",
      links: [{ label: "BiMap", href: "https://github.com/krishnapilato/bimap" }, { label: "PixelPaper", href: "https://github.com/krishnapilato/pixelpaper" }],
    },
  ],
});
