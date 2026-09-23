export type Lang = "en" | "it";

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
  languageLabel: string;
  hotkeyHint: string;
};

export const COPY: Record<Lang, Copy> = {
  en: {
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
      "Two countries, two languages, one habit — taking something complicated and making it feel simple.",
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
    languageLabel: "Language",
    hotkeyHint: "switch language",
  },
  it: {
    documentTitle: "Khova Krishna Pilato — Sviluppatore Full Stack Java",
    metaDescription:
      "Portfolio di Khova Krishna Pilato, Sviluppatore Full Stack Java a Pavia. Spring Boot, Angular e React. Il nuovo sito è in arrivo.",
    status: "Sito in sviluppo",
    headLeft: "Portfolio",
    headRight: "Seconda edizione",
    eyebrow: "In arrivo",
    rolePre: "Sviluppatore Full Stack",
    roleAccent: "Java",
    rolePost: "",
    lede: "Quattro anni di esperienza nella realizzazione di piattaforme web scalabili per clienti dei settori bancario, assicurativo, farmaceutico, automotive ed energetico — servizi Spring Boot e API REST sul backend, Angular e React sul frontend.",
    launchLabel: "Lancio previsto",
    units: {
      day: "Giorno",
      days: "Giorni",
      hours: "Ore",
      minutes: "Minuti",
      seconds: "Secondi",
    },
    live: "Il nuovo portfolio sta per andare online.",
    stackLabel: "Stack principale",
    contact: "Scrivimi",
    scrollCue: "La storia fin qui",
    prologueKicker: "Prologo",
    prologueLine: "Nato a Bangalore. Cresciuto in Italia. Costruisco in Java.",
    prologueBody:
      "Due paesi, due lingue, una sola abitudine — prendere qualcosa di complicato e farlo sembrare semplice.",
    storyKicker: "Quattro capitoli",
    storyTitle: "Come il lavoro è arrivato fin qui",
    chapters: [
      {
        id: "foundations",
        numeral: "01",
        kicker: "Capitolo 01",
        period: "2016 — 2022",
        place: "Voghera · Milano",
        title: "Fondamenta",
        body: "Diploma tecnico in informatica e telecomunicazioni, poi subito nel Java enterprise: manutenzione ed evoluzione di una piattaforma di fatturazione luce e gas costruita su Java 8, Oracle DB e GWT. Codice datato, utenti veri, nessuna scorciatoia.",
      },
      {
        id: "scale",
        numeral: "02",
        kicker: "Capitolo 02",
        period: "2022 — 2025",
        place: "Milano · Remoto",
        title: "Sistemi che reggono il peso",
        body: "Il passaggio al full-stack, guidando lo sviluppo di un progetto IoT per la R&D di Bosch in un team Scrum completamente da remoto. Poi Intesa Sanpaolo — funzionalità e ottimizzazioni del CRM in Angular, e i servizi backend di Custody in Java, Spring Boot e MongoDB.",
      },
      {
        id: "precision",
        numeral: "03",
        kicker: "Capitolo 03",
        period: "2025 — 2026",
        place: "Milano · Pavia",
        title: "Precisione sotto normativa",
        body: "Interfacce assicurative responsive in Angular 12 e AngularJS su backend Spring e Mule. Poi il software per il packaging farmaceutico di SEA Vision: Angular 18, Material CDK, componenti riutilizzabili e viste dati in tempo reale all'altezza degli standard normativi del settore.",
      },
      {
        id: "today",
        numeral: "04",
        kicker: "Capitolo 04",
        period: "2026 — oggi",
        place: "Milano",
        title: "I dati che muovono una città",
        body: "In ATM, i dati operativi della rete di trasporto pubblico di Milano — puntualità e performance misurate in SQL, validate su larga scala, automatizzate nei report KPI settimanali e mensili su cui poggiano decisioni reali.",
      },
    ],
    projectsKicker: "Capitolo 05",
    projectsTitle: "In costruzione adesso",
    projectsNote: "Tre cose attualmente sul banco di lavoro.",
    projects: [
      {
        name: "BiMap",
        blurb:
          "Regioni, province e comuni su una mappa interattiva, dietro una dashboard admin con ruoli e autenticazione JWT.",
        tech: "Angular 22 · Leaflet · Java 26 · Spring Security · MySQL",
      },
      {
        name: "PixelPaper",
        blurb:
          "Uno scanner documenti offline e privacy-first: acquisizione da fotocamera, miglioramento immagine, riordino ed esportazione in PDF.",
        tech: "Flutter · Dart · Syncfusion PDF · Material 3",
      },
      {
        name: "Questo portfolio",
        blurb:
          "Un frontend React 19 affiancato a una API Spring Boot 4 — autenticazione JWT, documentazione OpenAPI e setup Dockerizzato dal primo commit.",
        tech: "React 19 · Spring Boot 4 · MySQL · Docker",
      },
    ],
    telemetryKicker: "Nota a piè di pagina",
    telemetryTitle: "Misurato, non dichiarato",
    telemetryNote:
      "Ogni numero qui sotto è letto dal vivo dal tuo browser mentre leggi questa pagina. Nessuna analitica, nessuna chiamata di rete, niente lascia il tuo dispositivo.",
    telemetryLabels: {
      fps: "Frame rate",
      load: "Caricamento",
      paint: "Primo paint",
      viewport: "Viewport",
      timezone: "Il tuo fuso",
      motion: "Animazioni",
    },
    motionFull: "Complete",
    motionReduced: "Ridotte",
    closingKicker: "Epilogo",
    closingTitle: "Il resto si sta scrivendo.",
    closingBody:
      "Case study, codice sorgente e il dettaglio dietro ogni capitolo arrivano con il nuovo sito. Fino ad allora, la porta è aperta.",
    location: "Pavia, Italia",
    localTime: "ora locale",
    languageLabel: "Lingua",
    hotkeyHint: "cambia lingua",
  },
};

export const LANGS: Lang[] = ["en", "it"];
export const DEFAULT_LANG: Lang = "en";

const STORAGE_KEY = "kkp.lang";

const isLang = (value: string | null): value is Lang =>
  value === "en" || value === "it";

/** A saved choice wins, then an Italian browser, otherwise English. */
export function resolveInitialLang(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage disabled — fall through */
  }
  if (navigator.language?.toLowerCase().startsWith("it")) return "it";
  return DEFAULT_LANG;
}

export function persistLang(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* non-fatal */
  }
}
