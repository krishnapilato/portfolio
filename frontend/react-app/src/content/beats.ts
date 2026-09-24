/**
 * The words. One block per beat, in the order of the film. Everything here
 * is true to the CV and the public profiles; nothing private is written.
 */
export type Link = { label: string; href: string; external?: boolean; copy?: string; value?: string };

/** One row of a definition list body: a term and its one-line description. */
export type Row = { term: string; detail: string };

export type BeatCopy = {
  id: string;
  kicker: string;
  title: string;
  /** Words in the title that are links (label → href), rendered inline. */
  titleLinks?: Record<string, string>;
  /** Prose, or a list of rows read as a list. */
  body: string | Row[];
  meta?: string;
  /** A line in the meta position that only makes sense in the film (not in the static article). */
  hint?: string;
  /** A link inside the meta line (label → href). */
  metaLink?: Record<string, string>;
  links?: Link[];
  /** Short uppercase name for the readout, and the tick's accessible label. */
  readout: string;
  tickLabel: string;
};

export const GITHUB = "https://github.com/krishnapilato";
export const LINKEDIN = "https://www.linkedin.com/in/khovakrishnapilato";
export const INSTAGRAM = "https://www.instagram.com/khovakrishna.pilato";
export const EMAIL = "krishnak.pilato@gmail.com";
export const PHONE_DISPLAY = "+39 338 296 5483";
export const PHONE_HREF = "tel:+393382965483";

/** His own headline's phrasing of where he is from, stated once in the identity beat. */
export const ORIGIN_CLAUSE = "Born in Bangalore, raised in Italy.";

export const CONTACTS: Link[] = [
  { label: "Email", href: `mailto:${EMAIL}`, value: EMAIL, copy: EMAIL },
  { label: "Telephone", href: PHONE_HREF, value: PHONE_DISPLAY, copy: PHONE_DISPLAY },
  { label: "LinkedIn", href: LINKEDIN, value: "linkedin.com/in/khovakrishnapilato", external: true },
  { label: "GitHub", href: GITHUB, value: "github.com/krishnapilato", external: true },
  { label: "Instagram", href: INSTAGRAM, value: "@khovakrishna.pilato", external: true },
];

export const BEATS: BeatCopy[] = [
  {
    id: "horizon",
    kicker: "Khova Krishna Pilato",
    title: "Straight and level.",
    body: `Full Stack Java Developer, working in Milan. ${ORIGIN_CLAUSE} Two countries, two languages, one habit: taking something complicated and making it feel simple.`,
    hint: "Scroll to begin",
    readout: "Horizon",
    tickLabel: "Beat 1 of 10: Straight and level",
  },
  {
    id: "instrument",
    kicker: "The instrument",
    title: "The horizon inside never moves.",
    body: "An attitude indicator keeps its horizon level while the aircraft pitches and rolls around it. This site is built the same way: the world moves, the reference stays.",
    meta: "Every part of this instrument is generated in code.",
    readout: "The instrument",
    tickLabel: "Beat 2 of 10: The instrument",
  },
  {
    id: "capgemini",
    kicker: "2022 — 2024",
    title: "Capgemini Engineering, Milan",
    body: "Kept an electricity and gas billing platform running on Java 8, Oracle and GWT. Then led development on a Bosch R&D IoT project in a fully remote Scrum team, owning core features across backend and frontend.",
    meta: "Full Stack Developer · Energy, automotive IoT · Diploma in Computer Science, ITIS A. Maserati, Voghera, 2021",
    readout: "Capgemini",
    tickLabel: "Beat 3 of 10: Capgemini Engineering",
  },
  {
    id: "intesa",
    kicker: "2024 — 2025",
    title: "Intesa Sanpaolo, Milan",
    body: "CRM features and performance work in Angular. Maintenance and evolution of the Custody application backend in Java, Spring Boot and MongoDB.",
    meta: "Full Stack Developer · External consultant · Banking",
    readout: "Intesa Sanpaolo",
    tickLabel: "Beat 4 of 10: Intesa Sanpaolo",
  },
  {
    id: "fincons-seavision",
    kicker: "2025 — 2026",
    title: "Fincons Group, then SEA Vision",
    body: "Insurance at Fincons Group, Milan: responsive Angular interfaces on Spring and Mule, in a critical delivery phase. Then pharmaceutical packaging software at SEA Vision, Pavia: Angular 18, Material CDK, real-time data views, delivered in sprints.",
    meta: "Frontend Developer · Insurance, pharma",
    readout: "Fincons · SEA Vision",
    tickLabel: "Beat 5 of 10: Fincons Group and SEA Vision",
  },
  {
    id: "atm",
    kicker: "2026 — today",
    title: "ATM, Milan",
    body: "Operational data across Milan's public transport network. Punctuality and performance measured in SQL, validated at scale, automated into weekly and monthly KPI reports.",
    meta: "Data and engineering · Azienda Trasporti Milanesi · Public transport",
    readout: "ATM",
    tickLabel: "Beat 6 of 10: ATM",
  },
  {
    id: "skills",
    kicker: "Skills",
    title: "Backend, frontend, data, cloud.",
    body: [
      { term: "Backend", detail: "Java 8 to 26, Spring Boot, Hibernate, REST, OAuth2, event-driven systems, Mule" },
      { term: "Frontend", detail: "Angular 10 to 22, React 19, TypeScript, SCSS, PrimeNG, Material CDK, Flutter" },
      { term: "Data", detail: "PostgreSQL, MySQL, MongoDB, Oracle" },
      { term: "Cloud & quality", detail: "Docker, AWS, Jenkins, GitHub Actions, JUnit, SonarQube, TDD" },
    ],
    meta: "English, native · Italian, fluent",
    readout: "Skills",
    tickLabel: "Beat 7 of 10: Skills",
  },
  {
    id: "projects",
    kicker: "Projects",
    title: "BiMap. PixelPaper. This site.",
    // The three names in the title are the links; the body carries none,
    // so the words stay readable and the eye is not pulled six ways.
    titleLinks: {
      BiMap: `${GITHUB}?tab=repositories&q=bimap`,
      PixelPaper: `${GITHUB}?tab=repositories&q=pixelpaper`,
      "This site": `${GITHUB}/portfolio`,
    },
    body: "BiMap: Italy's regions, provinces and municipalities on an interactive map, behind a role-based admin dashboard with JWT auth. Angular 22, Leaflet, Java 26, Spring Security, MySQL. PixelPaper: a privacy-first, offline document scanner in Flutter, with image enhancement, page reordering and PDF export. This site: React 19 and three.js, every part generated in code; the repository also carries a Spring Boot 4 API.",
    meta: "Also tasky and clockify · github.com/krishnapilato",
    metaLink: { "github.com/krishnapilato": GITHUB },
    readout: "Projects",
    tickLabel: "Beat 8 of 10: Projects",
  },
  {
    id: "aviation",
    kicker: "Aviation",
    title: "Four hours, forty-two minutes.",
    body: "Six dual lessons in a Cessna 172 at Venegono, March to May 2025: air experience, effect of controls, taxi, attitudes, straight-and-level flight. Six take-offs, six landings. At home, a flight simulator flown by the checklist, every time. Training continues. Dream aircraft: the A380.",
    meta: "Aero Club Varese · I-ISEB · I-CCBF · I-FFAE",
    readout: "Aviation",
    tickLabel: "Beat 9 of 10: Aviation",
  },
  {
    id: "contact",
    kicker: "Contact",
    title: "Trimmed, and level.",
    body: "Trim doesn't steer the aircraft. It takes the load off the controls so the pilot can look outside. Good engineering feels the same. Based near Pavia, working in Milan, available to work abroad.",
    links: CONTACTS,
    readout: "Contact",
    tickLabel: "Beat 10 of 10: Contact",
  },
];
