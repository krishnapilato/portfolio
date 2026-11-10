// The story, in reading order. Professional facts come from the supplied profile; the personal phone number is intentionally omitted.
// `record` is the evidence behind a reflection. `pause` is a single line left alone on an empty screen before the next chapter.
export type Chapter = { id: string; numeral: string; theme: string; statement: string; paragraphs: string[]; record?: string; pause?: string };

export const opening = {
  name: "Khova Krishna Pilato",
  role: "Full Stack Java Developer",
  title: "Software, built with care.",
  lead: "Six short reflections on what software owes the people who use it, drawn from five years of building it.",
  hint: "The ink follows your attention. Move, scroll, or press Tab.",
};

export const chapters: Chapter[] = [
  {
    id: "time", numeral: "I", theme: "Time",
    statement: "Twenty minutes became two.",
    paragraphs: [
      "At ATM Milano, every service notice used to cost someone twenty minutes: drafting, review, approval, publication, the same steps by hand each time. I built ComunicatiNET to carry a notice through that whole path.",
      "It now takes two. I think about the other eighteen. They are not a metric. They belong to a person, who gets them back every time a line is diverted and the city needs to be told.",
    ],
    record: "ATM Milano · Full Stack Developer · C#, .NET 8, SQL Server · 2026 to today",
    pause: "Nobody writes to thank you for the time they did not lose.",
  },
  {
    id: "privacy", numeral: "II", theme: "Privacy",
    statement: "What a system never learns, it can never leak.",
    paragraphs: [
      "PixelPaper is a document scanner for Android. It finds the edges of a page and reads its text, and it does all of it on the phone. It works offline, so nothing has to leave the device.",
      "This page follows the same rule. No analytics, no cookies, no fonts fetched from someone else’s server. I do not know that you are here, and I would like to keep it that way.",
    ],
    record: "PixelPaper · Personal project · Flutter, Google ML Kit, edge detection, OCR",
    pause: "Collect less. It is the only data that is always safe.",
  },
  {
    id: "place", numeral: "III", theme: "Place",
    statement: "A register lists a place. A map lets you stand in it.",
    paragraphs: [
      "Italy keeps careful records of its land and its heritage, in tables few people ever open. BiMap puts those cadastral and heritage assets on a map, with property data and authenticated access in one experience.",
      "The data was already there. What was missing was context, and context is most of what an interface is for.",
    ],
    record: "BiMap · Personal project · Angular, Spring Boot microservices, JWT, MySQL, Leaflet, Docker Compose, GitHub Actions",
  },
  {
    id: "trust", numeral: "IV", theme: "Trust",
    statement: "Most people meet my work without knowing it exists.",
    paragraphs: [
      "I started in 2021 as an intern at AGM Solutions, improving Java and Spring Boot services for real clients. At Capgemini Engineering I spent a year on an electricity and gas billing platform, then another building device monitoring for a Bosch research project.",
      "At Intesa Sanpaolo I worked on the bank’s CRM while it moved from a monolith to microservices. Then came an insurance delivery with Fincons Group, pharmaceutical packaging software at SEA Vision, and now Milan’s public transport.",
      "A bill, a bank, a medicine box, a tram. Nobody using them thinks about the software, and that is the point. Trust is what remains when a system gives people no reason to notice it.",
    ],
    record: "2021 to today · Energy, IoT, banking, insurance, pharmaceuticals, public transport",
    pause: "Reliability is a quiet way of keeping a promise.",
  },
  {
    id: "doubt", numeral: "V", theme: "Doubt",
    statement: "Confidence is not evidence.",
    paragraphs: [
      "Pilots use checklists because feeling sure and being right are different things. Aviation and flight simulation keep reminding me of that, and I bring it to engineering: tests that mean something, decisions written down, architecture someone else can follow.",
      "It is a way of caring for people I may never meet: the next developer, the operator on a difficult day, the person trusting the screen.",
      "I was born in Bengaluru and raised in Italy. I studied Computer Science and Telecommunications at IIS A. Maserati in Voghera, and I work in Italian and English.",
    ],
    record: "Pavia, Italy",
  },
  {
    id: "craft", numeral: "VI", theme: "Craft",
    statement: "Judgment first. Then the tools.",
    paragraphs: [
      "For the record: Java, Spring Boot, Spring Security and Hibernate hold the foundations. Angular, TypeScript, React and Flutter face the people. Oracle, MySQL, PostgreSQL and MongoDB keep the facts. JUnit, Docker, Git and CI/CD keep me honest.",
      "Any of them can be learned in a season. Knowing what to leave out takes longer.",
    ],
  },
];

export const closing = {
  statement: "Build something worth trusting.",
  invitation: "I am open to full-stack Java and backend roles, in Italy and internationally. If this is how you think software should be built, write to me.",
  email: "krishnak.pilato@gmail.com",
  linkedin: "https://www.linkedin.com/in/khovakrishnapilato",
  github: "https://github.com/krishnapilato",
};
