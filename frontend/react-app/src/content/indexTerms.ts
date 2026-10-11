/**
 * The back-of-book index: tools, sectors, places and the rest, each with
 * the pages it appears on. `validate.ts` checks every citation against the
 * words on the cited page.
 */
export type IndexEntry = { term: string; pages: number[]; sub?: IndexEntry[]; match?: string };
export type IndexColumn = { title: string; entries: IndexEntry[] };

export const INDEX: IndexColumn[] = [
  {
    title: "Tools",
    entries: [
      { term: "AWS", pages: [3] },
      { term: "Angular", pages: [3, 7, 9, 10, 13] },
      { term: "Docker", pages: [3] },
      { term: "Event-driven systems", pages: [3], match: "event-driven" },
      { term: "Flutter and Dart", pages: [3, 14], match: "Flutter" },
      { term: "GitHub Actions", pages: [3] },
      { term: "GSAP", pages: [15] },
      { term: "GWT", pages: [6] },
      { term: "Hibernate/JPA", pages: [3] },
      { term: "Java", pages: [1, 3, 6, 7, 13] },
      { term: "Jenkins", pages: [3] },
      { term: "JUnit", pages: [3] },
      { term: "JWT", pages: [13] },
      { term: "Leaflet", pages: [13] },
      { term: "Material CDK", pages: [3, 10] },
      { term: "Microservices", pages: [3] },
      { term: "MongoDB", pages: [3, 7] },
      { term: "Mule", pages: [3, 9] },
      { term: "MySQL", pages: [3, 13] },
      { term: "OAuth2", pages: [3] },
      { term: "Oracle", pages: [3, 6] },
      { term: "PostgreSQL", pages: [3] },
      { term: "PrimeNG", pages: [3] },
      { term: "React", pages: [3, 15] },
      { term: "REST", pages: [3] },
      { term: "SCSS", pages: [3] },
      { term: "SonarQube", pages: [3] },
      {
        term: "Spring",
        pages: [9],
        sub: [
          { term: "Boot", pages: [3, 7, 15], match: "Spring Boot" },
          { term: "Security", pages: [3, 13], match: "Spring Security" },
        ],
      },
      { term: "SQL", pages: [3, 11] },
      { term: "TDD", pages: [3] },
      { term: "TypeScript", pages: [3, 15] },
      { term: "Vite", pages: [15] },
    ],
  },
  {
    title: "Sectors",
    entries: [
      { term: "Automotive IoT", pages: [6] },
      { term: "Banking", pages: [7] },
      { term: "Energy", pages: [6] },
      { term: "Insurance", pages: [9] },
      { term: "Pharma", pages: [10] },
      { term: "Public transport", pages: [11] },
    ],
  },
  {
    title: "Places",
    entries: [
      { term: "Dublin", pages: [8] },
      { term: "Milan", pages: [1, 3, 6, 7, 9, 11, 18] },
      { term: "Pavia", pages: [3, 10, 18] },
      { term: "Venegono", pages: [16] },
      { term: "Voghera", pages: [5] },
    ],
  },
  {
    title: "Also",
    entries: [
      { term: "Airbus A380", pages: [16] },
      { term: "Aviation", pages: [16] },
      { term: "Cessna 172", pages: [16] },
      { term: "English", pages: [2, 8] },
      { term: "Italian", pages: [2] },
      { term: "KPI reports", pages: [11], match: "KPI" },
      { term: "Scrum", pages: [6] },
    ],
  },
];
