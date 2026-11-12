// The story, in reading order. Each scene is one thought: a statement, a few sentences that earn it,
// and a quiet line with the facts behind it. Facts come from the supplied profile; the phone number is omitted.
export type Link = { label: string; href: string };
export type Scene = { id: string; title: string; text: string[]; note?: string; links?: Link[] };

export const person = {
  name: "Khova Krishna Pilato",
  email: "krishnak.pilato@gmail.com",
  linkedin: "https://www.linkedin.com/in/khovakrishnapilato",
  github: "https://github.com/krishnapilato",
};

export const scenes: Scene[] = [
  {
    id: "start", title: person.name,
    text: ["Full stack Java developer, based in Pavia.", "Five years of building software, and what it has taught me."],
  },
  {
    id: "attention", title: "Twenty minutes became two.",
    text: [
      "At ATM, Milan’s public transport company, a service notice used to pass through four hands before reaching passengers. I built one place where it is drafted, reviewed, approved and published.",
      "The minutes are not the point. The attention they give back is.",
    ],
    note: "ATM Milano, since 2026. C#, .NET 8 and SQL Server.",
  },
  {
    id: "care", title: "Most software is already running.",
    text: [
      "At Intesa Sanpaolo I helped move a banking platform to microservices while it kept serving people. At Fincons Group I rebuilt insurance quotation screens in the middle of a delivery.",
      "I learned to read a system before changing it, and to change it gently.",
    ],
    note: "Intesa Sanpaolo and Fincons Group, 2024 to 2025. Java, Spring Boot and Angular.",
  },
  {
    id: "honesty", title: "Behind every screen, a machine.",
    text: [
      "For SEA Vision I built the interfaces that configure pharmaceutical packaging lines and follow their sensors in real time. Before that, at Capgemini, a dashboard showing where each Bosch machine stood and how it was running.",
      "An interface is honest when it shows what is really happening.",
    ],
    note: "SEA Vision and Capgemini Engineering, 2022 to 2026. Angular and Spring Boot.",
  },
  {
    id: "privacy", title: "Where should a document be read?",
    text: [
      "PixelPaper finds the edges of a page and reads its text on the phone itself, even without a connection.",
      "Some things should never leave the hand that holds them. For me, privacy begins as an architectural decision.",
    ],
    note: "A personal project. Flutter and Google ML Kit.",
    links: [{ label: "PixelPaper on GitHub", href: "https://github.com/krishnapilato/pixelpaper" }],
  },
  {
    id: "place", title: "Information needs a place.",
    text: [
      "BiMap sets Italian cadastral and heritage records on a map. A register tells you that a property exists. A map shows you where it stands, and what surrounds it.",
    ],
    note: "A personal project. Angular, Spring Boot, MySQL and Leaflet.",
    links: [{ label: "BiMap on GitHub", href: "https://github.com/krishnapilato/bimap" }],
  },
  {
    id: "memory", title: "Old words, new ways in.",
    text: [
      "Francesco Cherubini recorded the vocabulary of Milanese trades. With Stefano Pilato, I brought 2,307 of its entries to the web and to an offline edition that share the same data and the same tests.",
      "Preserving a work also means keeping it usable.",
    ],
    note: "React, TypeScript, JavaFX and SQLite.",
    links: [
      { label: "Open the dictionary", href: "https://krishnapilato.github.io/cherubini-digital-edition/" },
      { label: "Source on GitHub", href: "https://github.com/krishnapilato/cherubini-digital-edition" },
    ],
  },
  {
    id: "awareness", title: "Learning to look twice.",
    text: [
      "I was born in Bengaluru and grew up in Italy, between two languages and two ways of seeing. Flight simulation taught me the rest: prepare, stay aware, decide deliberately.",
      "I bring the same checklist to engineering. Assume little. Verify what matters.",
    ],
    note: "Pavia, Italy. Italian and English.",
  },
  {
    id: "craft", title: "Someone else will read this code.",
    text: [
      "A name gives direction. A test records an expectation. A written decision explains a constraint.",
      "Maintenance is a conversation with the next person who opens the project. I try to leave them a clear one.",
    ],
    note: "Java, Spring Boot, Angular, TypeScript, React and SQL.",
  },
  {
    id: "contact", title: "What are you working on?",
    text: ["I’m open to full stack Java and backend roles, in Italy and internationally. I’d like to hear how your team works."],
  },
];
