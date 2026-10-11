/**
 * Every visible word of the book, in reading order. Facts come only from the
 * owner's CV and public profiles; nothing private is written here.
 *
 * An edit is a crowded draft and its fair copy. The draft is plain words
 * plus jargon groups; the fair copy is the same plain words, in the same
 * order, with a reference number where each group was taken out. Each
 * group's words become the words of its note. `validate.ts` checks the
 * counts, because the animation pairs them word for word.
 */

export type DraftPart = string | { note: number; text: string };
export type FairPart = string | { ref: number };
export type Note = { n: number; text: string | string[] };

export type EditCopy = {
  id: string;
  draft: DraftPart[];
  fair: FairPart[];
  /** Notes that the edit fills: one per jargon group, in order. */
  notes: Note[];
  /** The phrase of the fair copy underlined once the edit is done. */
  mark?: string;
};

export type Contact = {
  label: string;
  value: string;
  href: string;
  /** The text the Copy button puts on the clipboard. */
  copy?: string;
  /** What the copied thing is called in announcements. */
  noun?: string;
};

export type Leaf = {
  id: string;
  folio: number;
  label: string;
  title: string;
  role?: string;
  /** A leaf has either an edit or a plain sentence. */
  edit?: EditCopy;
  sentence?: FairPart[];
  notes?: Note[];
  /** Half-width page tipped in on a tinted ground. */
  tipped?: boolean;
  /** Year drawn large behind the leaf, registered to it. */
  year?: string;
};

export type Plate = {
  id: "bimap" | "pixelpaper" | "this-site";
  folio: number;
  label: string;
  numeral: string;
  title: string;
  sentence: FairPart[];
  note: string;
  source: string;
  figureLabel: string;
  caption: string;
};

export const OWNER = "Khova Krishna Pilato";
export const ROLE = "Full Stack Java Developer";
export const SITE_URL = "https://krishnapilato.github.io/portfolio/";
export const GITHUB = "https://github.com/krishnapilato";

export const TITLE = {
  label: "Portfolio · 2026",
  nameLines: ["Khova Krishna", "Pilato"],
  headline: ["Born in Bangalore.", "Raised in Italy.", "Building in Java."],
  subline: "Full Stack Java Developer, Milan. Available to work abroad.",
  contentsLabel: "Contents",
};

export const ONE_HABIT = {
  heading: "One habit",
  columnA: "Two countries,",
  columnB: "two languages,",
  rest: "one habit: taking something complicated and making it ",
  mark: "feel simple",
  end: ".",
  notes: [
    { n: 1, text: "Born in Bangalore, raised in Italy." },
    { n: 2, text: "English, native · Italian, fluent." },
  ] satisfies Note[],
};

export const PLAIN_WORDS = {
  heading: "In plain words",
  labelDraft: "Draft",
  labelFair: "Fair copy",
  edit: {
    id: "plain-words",
    draft: [
      "I build software",
      {
        note: 1,
        text: "(backend: Java 8 to 26, Spring Boot, Spring Security, Hibernate/JPA, REST, OAuth2, microservices, event-driven systems, Mule; frontend: Angular 10 to 22, React 19, TypeScript, SCSS, PrimeNG, Material CDK, Flutter/Dart; data: PostgreSQL, MySQL, MongoDB, Oracle, SQL analytics; cloud and quality: Docker, AWS, Jenkins, GitHub Actions, JUnit, SonarQube, TDD)",
      },
      "for people who should never have to think about any of that.",
    ],
    fair: ["I build software", { ref: 1 }, "for people who should never have to think about any of that."],
    notes: [
      {
        n: 1,
        text: [
          "Backend: Java 8 to 26, Spring Boot, Spring Security, Hibernate/JPA, REST, OAuth2, microservices, event-driven systems, Mule;",
          "Frontend: Angular 10 to 22, React 19, TypeScript, SCSS, PrimeNG, Material CDK, Flutter/Dart;",
          "Data: PostgreSQL, MySQL, MongoDB, Oracle, SQL analytics;",
          "Cloud and quality: Docker, AWS, Jenkins, GitHub Actions, JUnit, SonarQube, TDD.",
        ],
      },
    ],
    mark: "any of that.",
  } satisfies EditCopy,
  body: "I work where clean code, cloud-native systems and user-first design meet, in six sectors so far: energy, automotive IoT, banking, insurance, pharma and public transport.",
  sidenote: "Lives in a village near Pavia. Works in Milan. Available to work abroad.",
};

export const EXPERIENCE = {
  stageLabel: "Experience · 2016 – today",
  heading: "Experience",
  lead: "From Voghera to Milan, by way of Dublin and Pavia. 2016 to today.",
  aside: "One sentence a page. The detail is in the notes.",
  todayLabel: "today",
};

export const LEAVES: Leaf[] = [
  {
    id: "maserati",
    folio: 5,
    year: "2016",
    label: "2016 – 2021 · Voghera",
    title: "ITIS A. Maserati",
    role: "Diploma",
    sentence: ["Five years learning how computers and networks talk to each other.", { ref: 1 }],
    notes: [{ n: 1, text: "Diploma in Computer Science and Telecommunications." }],
  },
  {
    id: "capgemini",
    folio: 6,
    year: "2022",
    label: "Jan 2022 – Jan 2024 · Milan",
    title: "Capgemini Engineering",
    role: "Full Stack Developer · Energy, automotive IoT",
    edit: {
      id: "capgemini",
      draft: [
        "Kept an electricity and gas billing platform running",
        { note: 1, text: "(Java 8, Oracle, GWT)," },
        "then led development on a Bosch R&D IoT project",
        { note: 2, text: "(fully remote Scrum team, core features owned across backend and frontend)." },
      ],
      fair: [
        "Kept an electricity and gas billing platform running,",
        { ref: 1 },
        "then led development on a Bosch R&D IoT project.",
        { ref: 2 },
      ],
      notes: [
        { n: 1, text: "Java 8, Oracle, GWT." },
        { n: 2, text: "Fully remote Scrum team, core features owned across backend and frontend." },
      ],
    },
  },
  {
    id: "intesa",
    folio: 7,
    year: "2024",
    label: "Jan 2024 – Apr 2025 · Milan",
    title: "Intesa Sanpaolo",
    role: "Full Stack Developer · External consultant · Banking",
    edit: {
      id: "intesa",
      draft: [
        "Built CRM features and did performance work on the front end",
        { note: 1, text: "(Angular)," },
        "and maintained and evolved the backend of the Custody application",
        { note: 2, text: "(Java, Spring Boot, MongoDB)." },
      ],
      fair: [
        "Built CRM features and did performance work on the front end,",
        { ref: 1 },
        "and maintained and evolved the backend of the Custody application.",
        { ref: 2 },
      ],
      notes: [
        { n: 1, text: "Angular." },
        { n: 2, text: "Java, Spring Boot, MongoDB." },
      ],
    },
  },
  {
    id: "dublin",
    folio: 8,
    tipped: true,
    label: "Jul – Oct 2024 · Dublin",
    title: "EF Dublin",
    role: "Intensive English course",
    sentence: ["An intensive English course, finished with a C1 certificate."],
  },
  {
    id: "fincons",
    folio: 9,
    year: "2025",
    label: "Apr – Jun 2025 · Milan",
    title: "Fincons Group",
    role: "Frontend Developer · Insurance",
    edit: {
      id: "fincons",
      draft: [
        "A critical delivery phase in insurance: interfaces that hold up on any screen",
        { note: 1, text: "(responsive Angular, integrated with Spring and Mule)." },
      ],
      fair: ["A critical delivery phase in insurance: interfaces that hold up on any screen.", { ref: 1 }],
      notes: [{ n: 1, text: "Responsive Angular, integrated with Spring and Mule." }],
    },
  },
  {
    id: "sea-vision",
    folio: 10,
    label: "Jul 2025 – Apr 2026 · Pavia",
    title: "SEA Vision",
    role: "Frontend Developer · Pharma",
    edit: {
      id: "sea-vision",
      draft: [
        "Software for pharmaceutical packaging: reusable components, and data you can watch as it happens",
        { note: 1, text: "(Angular 18, Material CDK, real-time data views, delivered in sprints)." },
      ],
      fair: [
        "Software for pharmaceutical packaging: reusable components, and data you can watch as it happens.",
        { ref: 1 },
      ],
      notes: [{ n: 1, text: "Angular 18, Material CDK, real-time data views, delivered in sprints." }],
    },
  },
  {
    id: "atm",
    folio: 11,
    year: "2026",
    label: "2026 – today · Milan",
    title: "ATM",
    role: "Data and engineering · Azienda Trasporti Milanesi · Public transport",
    edit: {
      id: "atm",
      draft: [
        "Operational data for Milan’s public transport: punctuality and performance, measured, checked and reported every week and every month",
        { note: 1, text: "(SQL, validated at scale, automated KPI reports)." },
      ],
      fair: [
        "Operational data for Milan’s public transport: punctuality and performance, measured, checked and reported every week and every month.",
        { ref: 1 },
      ],
      notes: [{ n: 1, text: "SQL, validated at scale, automated KPI reports." }],
    },
  },
];

export const NEXT_LEAF = {
  id: "next",
  folio: 12,
  label: "After today",
  title: "Next",
  sentence: "Not printed yet. Available to work abroad.",
  link: "Correspondence, page 18",
};

export const WORK = {
  heading: "Work",
  lead: "Three projects, each drawn as a plate. The stack is in the notes.",
  also: {
    before: "Also on GitHub: ",
    links: [
      { text: "tasky", href: `${GITHUB}/tasky`, after: ", a Java to-do app, and " },
      { text: "clockify", href: `${GITHUB}/clockify`, after: ", timer experiments. Everything else: " },
      { text: "github.com/krishnapilato", href: GITHUB, after: "." },
    ],
  },
};

export const PLATES: Plate[] = [
  {
    id: "bimap",
    folio: 13,
    numeral: "I",
    label: "Plate I · Schematic",
    title: "BiMap",
    sentence: [
      "Every region, province and municipality of Italy on one map, behind a dashboard that knows who may change what.",
      { ref: 1 },
    ],
    note: "Role-based admin, JWT authentication. Angular 22, Leaflet, Java 26, Spring Security, MySQL.",
    source: `${GITHUB}/bimap`,
    figureLabel: "Schematic: one region divided into provinces, each divided into municipalities.",
    caption: "Region · Province · Municipality",
  },
  {
    id: "pixelpaper",
    folio: 14,
    numeral: "II",
    label: "Plate II",
    title: "PixelPaper",
    sentence: [
      "A document scanner that works offline and keeps your pages to yourself: crooked photos become straight, ordered PDFs.",
      { ref: 1 },
    ],
    note: "Flutter and Dart. Image enhancement, page reordering, PDF export.",
    source: `${GITHUB}/pixelpaper`,
    figureLabel: "Drawing: a crooked page becomes straight, and three pages are put in order.",
    caption: "Straightened, enhanced, reordered, exported.",
  },
  {
    id: "this-site",
    folio: 15,
    numeral: "III",
    label: "Plate III",
    title: "This site",
    sentence: ["This page: plain sentences above the rule, the detail below it.", { ref: 1 }],
    note: "React 19, TypeScript, Vite and GSAP. The repository also carries a Spring Boot 4 API.",
    source: `${GITHUB}/portfolio`,
    figureLabel: "Drawing: a two-page spread with text above a rule and notes below it.",
    caption: "The book you are reading, drawn small.",
  },
];

export const AWAY = {
  heading: "Away from the desk",
  lead: "Aviation is my passion and my direction.",
  body: [
    "I fly a home simulator seriously: procedures, checklists, visual scanning. Between March and May 2025 I flew six dual lessons in a Cessna 172 at Venegono, with Aero Club Varese.",
    { ref: 1 },
    " ",
  ] as FairPart[],
  bodyMark: "Training continues.",
  edit: {
    id: "away",
    draft: [
      "From my note “Simulator Trim: Why and How”: trim does not steer the aircraft",
      { note: 2, text: "(set power and pitch, hold steady, let the airspeed settle, trim, release, watch the nose);" },
      "it takes the load off the controls, so the pilot can fly hands-free, look outside and scan.",
    ],
    fair: [
      "From my note “Simulator Trim: Why and How”: trim does not steer the aircraft;",
      { ref: 2 },
      "it takes the load off the controls, so the pilot can fly hands-free, look outside and scan.",
    ],
    notes: [{ n: 2, text: "Set power and pitch, hold steady, let the airspeed settle, trim, release, watch the nose." }],
  } satisfies EditCopy,
  closing: "The aircraft I would most like to fly one day: the Airbus A380.",
  notes: [
    {
      n: 1,
      text: "4 h 42 min dual. Six take-offs, six landings. I-ISEB, I-CCBF, I-FFAE. Air experience, effect of controls, taxi, attitudes, straight-and-level flight.",
    },
  ] satisfies Note[],
};

export const INDEX_PAGE = {
  heading: "Index",
  lead: "Tools, sectors and places, with the pages they appear on.",
};

export const CORRESPONDENCE = {
  heading: "Correspondence",
  lead: "Based near Pavia, working in Milan. Available for work in Milan and abroad.",
  colophon: "Set in Newsreader and IBM Plex Mono. Built with React, TypeScript and GSAP, and drawn in SVG. 2026.",
};

export const CONTACTS: Contact[] = [
  {
    label: "Email",
    value: "krishnak.pilato@gmail.com",
    href: "mailto:krishnak.pilato@gmail.com",
    copy: "krishnak.pilato@gmail.com",
    noun: "email address",
  },
  {
    label: "Telephone",
    value: "+39 338 296 5483",
    href: "tel:+393382965483",
    copy: "+39 338 296 5483",
    noun: "telephone number",
  },
  { label: "LinkedIn", value: "linkedin.com/in/khovakrishnapilato", href: "https://www.linkedin.com/in/khovakrishnapilato" },
  { label: "GitHub", value: "github.com/krishnapilato", href: GITHUB },
  { label: "Instagram", value: "@khovakrishna.pilato", href: "https://www.instagram.com/khovakrishna.pilato" },
];

export const SKIP = {
  toCorrespondence: "Skip to correspondence",
  pastExperience: "Skip past Experience",
};

/** Splits a run of text into words, keeping punctuation on its word. */
export const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);

/** Every word of a note, across its lines. */
export const noteWords = (note: Note) => (Array.isArray(note.text) ? note.text : [note.text]).flatMap(words);
