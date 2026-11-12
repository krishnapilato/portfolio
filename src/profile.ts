// The story, in reading order. Professional facts come from the supplied profile; the personal phone number is intentionally omitted.
// Each chapter connects a professional decision with its practical consequence.
export type Chapter = { id: string; theme: string; statement: string; paragraphs: string[]; record?: string; links?: { label: string; href: string }[] };

export const opening = {
  name: "Khova Krishna Pilato",
  role: "Full Stack Java Developer",
  lead: "From a service used across Milan to a dictionary given a second life. Software is how I connect the two.",
  hint: "Discover my work",
};

export const chapters: Chapter[] = [
  {
    id: "time", theme: "Current work",
    statement: "Twenty minutes, reduced to two.",
    paragraphs: [
      "At ATM Milano, I develop software for public transport operations. I built ComunicatiNET to bring drafting, review, approval and publication into one workflow.",
      "A service notice that took twenty minutes now takes two. The improvement comes from treating the whole sequence as one task. I look for those handovers where software can give someone their attention back.",
    ],
    record: "ATM Milano · Full Stack Developer · C#, .NET 8, SQL Server · 2026 to today",
  },
  {
    id: "privacy", theme: "Personal project · PixelPaper",
    statement: "Where should a document be read?",
    paragraphs: [
      "I built PixelPaper for Android with Flutter and Google ML Kit. It detects page edges and recognises text directly on the device.",
      "Keeping recognition on the phone also keeps the document there. That choice shapes both the architecture and the experience. Someone can scan a page wherever they are, even without a connection.",
    ],
    record: "PixelPaper · Personal project · Flutter, Google ML Kit, edge detection, OCR",
  },
  {
    id: "place", theme: "Personal project · BiMap",
    statement: "An address for the information.",
    paragraphs: [
      "BiMap brings cadastral and heritage assets onto an interactive map, alongside property data and authenticated access.",
      "Angular, Spring Boot and Leaflet connect those records to a place you can recognise. I am interested in that moment when the structure of an interface helps someone understand what they are looking at.",
    ],
    record: "BiMap · Personal project · Angular, Spring Boot microservices, JWT, MySQL, Leaflet, Docker Compose, GitHub Actions",
  },
  {
    id: "cherubini", theme: "Digital edition · Cherubini",
    statement: "Old words, new ways in.",
    paragraphs: [
      "Cherubini recorded the vocabulary of Milanese trades, tools and materials. Building on Stefano Pilato’s Voci tecniche, I brought 2,307 entries into a React web edition and an offline JavaFX application.",
      "Both editions share the source data and the search test cases. A reader can explore the same words in either setting. Preserving a work also means keeping it usable."
    ],
    record: "React, TypeScript · JavaFX, SQLite · Shared search tests",
    links: [
      { label: "Explore the dictionary", href: "https://krishnapilato.github.io/cherubini-digital-edition/" },
      { label: "View repository", href: "https://github.com/krishnapilato/cherubini-digital-edition" }
    ],
  },
  {
    id: "trust", theme: "Experience",
    statement: "A new domain changes the questions.",
    paragraphs: [
      "I started at AGM Solutions in 2021. At Capgemini Engineering, I worked on energy billing and device monitoring for a Bosch research project.",
      "My experience also includes the CRM migration at Intesa Sanpaolo, insurance work with Fincons Group and pharmaceutical packaging at SEA Vision. Today, I bring that experience to ATM Milano.",
    ],
    record: "2021 to today · Energy, IoT, banking, insurance, pharmaceuticals, public transport",
  },
  {
    id: "doubt", theme: "About me",
    statement: "Learning to look twice.",
    paragraphs: [
      "I was born in Bengaluru and grew up in Italy. I studied Computer Science and Telecommunications at IIS A. Maserati in Voghera. I am based in Pavia and work in Italian and English.",
      "Outside software, I am interested in aviation and flight simulation. That interest carries into my work through careful checks, explicit decisions and attention to how a system behaves under pressure.",
    ],
    record: "Pavia, Italy",
  },
  {
    id: "craft", theme: "Skills & approach",
    statement: "Someone else will read this code.",
    paragraphs: [
      "Java and Spring Boot are at the centre of my work. I also build interfaces with Angular and React, mobile applications with Flutter, and work with relational and document databases.",
      "A method name gives someone a direction. A test records an expectation. A documented decision explains the constraint behind it. I think of maintenance as a conversation with the next person who opens the project.",
    ],
    record: "Java, Spring Boot, Spring Security, Hibernate · Angular, TypeScript, React, Flutter · Oracle, MySQL, PostgreSQL, MongoDB · JUnit, Docker, Git, CI/CD",
  },
];

export const closing = {
  statement: "What are you working on?",
  invitation: "I am open to full-stack Java and backend roles in Italy and internationally. Get in touch to talk about your team, a project, or working together.",
  email: "krishnak.pilato@gmail.com",
  linkedin: "https://www.linkedin.com/in/khovakrishnapilato",
  github: "https://github.com/krishnapilato",
};
