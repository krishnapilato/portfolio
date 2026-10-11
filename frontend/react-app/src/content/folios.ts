/**
 * The book's page numbers. Contents, leaf folios and the Index all read
 * from here, so a page number can never point at the wrong page.
 */
export type Page = { folio: number; id: string; title: string };

export const PAGES: Page[] = [
  { folio: 1, id: "title", title: "Title page" },
  { folio: 2, id: "one-habit", title: "One habit" },
  { folio: 3, id: "plain-words", title: "In plain words" },
  { folio: 4, id: "experience", title: "Experience" },
  { folio: 5, id: "maserati", title: "ITIS A. Maserati" },
  { folio: 6, id: "capgemini", title: "Capgemini Engineering" },
  { folio: 7, id: "intesa", title: "Intesa Sanpaolo" },
  { folio: 8, id: "dublin", title: "EF Dublin" },
  { folio: 9, id: "fincons", title: "Fincons Group" },
  { folio: 10, id: "sea-vision", title: "SEA Vision" },
  { folio: 11, id: "atm", title: "ATM" },
  { folio: 12, id: "next", title: "Next" },
  { folio: 13, id: "bimap", title: "BiMap" },
  { folio: 14, id: "pixelpaper", title: "PixelPaper" },
  { folio: 15, id: "this-site", title: "This site" },
  { folio: 16, id: "away", title: "Away from the desk" },
  { folio: 17, id: "index", title: "Index" },
  { folio: 18, id: "correspondence", title: "Correspondence" },
];

export const pageByFolio = (folio: number) => {
  const page = PAGES.find((p) => p.folio === folio);
  if (!page) throw new Error(`No page ${folio}`);
  return page;
};

/** The Contents: chapters only, in order. */
export const CONTENTS = [2, 3, 4, 13, 16, 17, 18].map(pageByFolio).map((page) => ({
  ...page,
  title: page.folio === 13 ? "Work" : page.title,
  id: page.folio === 13 ? "work" : page.id,
}));
