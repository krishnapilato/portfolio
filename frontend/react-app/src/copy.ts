export type Chapter = {
  id: string;
  numeral: string;
  kicker: string;
  period: string;
  place: string;
  title: string;
  body: string;
};

export type Project = {
  name: string;
  blurb: string;
  tech: string;
};

export type Copy = {
  documentTitle: string;
  metaDescription: string;
  status: string;
  headLeft: string;
  headRight: string;
  eyebrow: string;
  rolePre: string;
  roleAccent: string;
  rolePost: string;
  lede: string;
  launchLabel: string;
  units: {
    day: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  live: string;
  stackLabel: string;
  contact: string;
  scrollCue: string;
  prologueKicker: string;
  prologueLine: string;
  prologueBody: string;
  storyKicker: string;
  storyTitle: string;
  chapters: Chapter[];
  projectsKicker: string;
  projectsTitle: string;
  projectsNote: string;
  projects: Project[];
  telemetryKicker: string;
  telemetryTitle: string;
  telemetryNote: string;
  telemetryLabels: {
    fps: string;
    load: string;
    paint: string;
    viewport: string;
    timezone: string;
    motion: string;
  };
  motionFull: string;
  motionReduced: string;
  closingKicker: string;
  closingTitle: string;
  closingBody: string;
  location: string;
  localTime: string;
};

export const COPY: Copy = {
  documentTitle: "Khova Krishna Pilato — Full Stack Java Developer",
  metaDescription:
    "Portfolio of Khova Krishna Pilato, Full Stack Java Developer based in Pavia, Italy. Spring Boot, Angular and React. The new site is launching soon.",
  status: "Site in development",
  headLeft: "Portfolio",
  headRight: "Second edition",
  eyebrow: "Coming soon",
  rolePre: "Full Stack",
  roleAccent: "Java",
  rolePost: "Developer",
  lede: "Four years building scalable web platforms for banking, insurance, pharmaceutical, automotive and energy clients — Spring Boot services and REST APIs on the back, Angular and React on the front.",
  launchLabel: "Estimated launch",
  units: {
    day: "Day",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  live: "The new portfolio is going live.",
  stackLabel: "Core stack",
  contact: "Get in touch",
  scrollCue: "The story so far",
  prologueKicker: "Prologue",
  prologueLine: "Born in Bangalore. Raised in Italy. Building in Java.",
  prologueBody:
    "A cross-cultural perspective, one habit — taking something complicated and making it feel simple.",
  storyKicker: "Four chapters",
  storyTitle: "How the work got here",
  chapters: [
    {
      id: "foundations",
      numeral: "01",
      kicker: "Chapter 01",
      period: "2016 — 2022",
      place: "Voghera · Milan",
      title: "Foundations",
      body: "A technical diploma in computer science and telecommunications, then straight into enterprise Java: maintaining and extending an electricity and gas billing platform built on Java 8, Oracle DB and GWT. Old code, real users, no shortcuts.",
    },
    {
      id: "scale",
      numeral: "02",
      kicker: "Chapter 02",
      period: "2022 — 2025",
      place: "Milan · Remote",
      title: "Systems that carry weight",
      body: "A move into full-stack, leading development on a Bosch R&D IoT project inside a fully remote Scrum team. Then Intesa Sanpaolo — CRM features and performance work in Angular, and Custody backend services in Java, Spring Boot and MongoDB.",
    },
    {
      id: "precision",
      numeral: "03",
      kicker: "Chapter 03",
      period: "2025 — 2026",
      place: "Milan · Pavia",
      title: "Precision under regulation",
      body: "Responsive insurance interfaces in Angular 12 and AngularJS over Spring and Mule backends. Then pharmaceutical packaging software at SEA Vision: Angular 18, Material CDK, reusable components and real-time data views held to the regulatory bar of the sector.",
    },
    {
      id: "today",
      numeral: "04",
      kicker: "Chapter 04",
      period: "2026 — today",
      place: "Milan",
      title: "Data that moves a city",
      body: "At ATM, operational data across Milan's public transport network — punctuality and performance measured in SQL, validated at scale, automated into the weekly and monthly KPI reports that real decisions rest on.",
    },
  ],
  projectsKicker: "Chapter 05",
  projectsTitle: "Being built right now",
  projectsNote: "Three things currently on the workbench.",
  projects: [
    {
      name: "BiMap",
      blurb:
        "Regions, provinces and municipalities on an interactive map, behind a role-based admin dashboard and JWT authentication.",
      tech: "Angular 22 · Leaflet · Java 26 · Spring Security · MySQL",
    },
    {
      name: "PixelPaper",
      blurb:
        "A privacy-first, offline-capable document scanner: camera capture, image enhancement, reordering and PDF export.",
      tech: "Flutter · Dart · Syncfusion PDF · Material 3",
    },
    {
      name: "This portfolio",
      blurb:
        "A React 19 frontend paired with a Spring Boot 4 API — JWT auth, OpenAPI docs and a Dockerized setup from the first commit.",
      tech: "React 19 · Spring Boot 4 · MySQL · Docker",
    },
  ],
  telemetryKicker: "Footnote",
  telemetryTitle: "Measured, not claimed",
  telemetryNote:
    "Every number below is read live from your own browser while you read this page. No analytics, no network calls, nothing leaves your device.",
  telemetryLabels: {
    fps: "Frame rate",
    load: "Page load",
    paint: "First paint",
    viewport: "Viewport",
    timezone: "Your timezone",
    motion: "Motion setting",
  },
  motionFull: "Full",
  motionReduced: "Reduced",
  closingKicker: "Epilogue",
  closingTitle: "The rest is being written.",
  closingBody:
    "Case studies, source code and the detail behind every chapter arrive with the new site. Until then, the door is open.",
  location: "Pavia, Italy",
  localTime: "local time",
};
