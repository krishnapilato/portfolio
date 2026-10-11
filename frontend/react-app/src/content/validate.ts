import {
  AWAY,
  CONTACTS,
  CORRESPONDENCE,
  EXPERIENCE,
  INDEX_PAGE,
  LEAVES,
  NEXT_LEAF,
  ONE_HABIT,
  PLAIN_WORDS,
  PLATES,
  TITLE,
  WORK,
  noteWords,
  words,
  type EditCopy,
  type FairPart,
  type Note,
} from "./copy";
import { PAGES } from "./folios";
import { INDEX } from "./indexTerms";

const fairText = (parts: FairPart[] = []) => parts.filter((p): p is string => typeof p === "string").join(" ");
const notesText = (notes: Note[] = []) => notes.map((n) => (Array.isArray(n.text) ? n.text.join(" ") : n.text)).join(" ");

/** The words printed on each page, for checking Index citations. */
export function pageTexts(): Map<number, string> {
  const texts = new Map<number, string>();
  texts.set(1, [TITLE.label, ...TITLE.nameLines, ...TITLE.headline, TITLE.subline].join(" "));
  texts.set(2, [ONE_HABIT.columnA, ONE_HABIT.columnB, ONE_HABIT.rest, ONE_HABIT.mark, notesText(ONE_HABIT.notes)].join(" "));
  texts.set(3, [fairText(PLAIN_WORDS.edit.fair), notesText(PLAIN_WORDS.edit.notes), PLAIN_WORDS.body, PLAIN_WORDS.sidenote].join(" "));
  texts.set(4, [EXPERIENCE.heading, EXPERIENCE.lead, EXPERIENCE.aside].join(" "));
  for (const leaf of LEAVES) {
    texts.set(
      leaf.folio,
      [leaf.label, leaf.title, leaf.role ?? "", fairText(leaf.edit?.fair ?? leaf.sentence), notesText(leaf.edit?.notes ?? leaf.notes)].join(" "),
    );
  }
  texts.set(12, [NEXT_LEAF.title, NEXT_LEAF.sentence].join(" "));
  for (const plate of PLATES) texts.set(plate.folio, [plate.title, fairText(plate.sentence), plate.note].join(" "));
  texts.set(
    16,
    [AWAY.heading, AWAY.lead, fairText(AWAY.body), AWAY.bodyMark, fairText(AWAY.edit.fair), AWAY.closing, notesText(AWAY.notes), notesText(AWAY.edit.notes)].join(" "),
  );
  texts.set(17, [INDEX_PAGE.heading, INDEX_PAGE.lead].join(" "));
  texts.set(18, [CORRESPONDENCE.heading, CORRESPONDENCE.lead, ...CONTACTS.map((c) => `${c.label} ${c.value}`), CORRESPONDENCE.colophon].join(" "));
  void WORK;
  return texts;
}

function checkEdit(edit: EditCopy, problems: string[]) {
  const plainOld = edit.draft.filter((p): p is string => typeof p === "string").flatMap(words);
  const plainNew = edit.fair.filter((p): p is string => typeof p === "string").flatMap(words);
  if (plainOld.length !== plainNew.length) {
    problems.push(`edit "${edit.id}": ${plainOld.length} plain draft words but ${plainNew.length} fair-copy words`);
  }
  const groups = edit.draft.filter((p): p is { note: number; text: string } => typeof p !== "string");
  const refs = edit.fair.filter((p): p is { ref: number } => typeof p !== "string").map((p) => p.ref);
  if (groups.map((g) => g.note).join() !== refs.join()) {
    problems.push(`edit "${edit.id}": jargon groups ${groups.map((g) => g.note)} do not match references ${refs}`);
  }
  for (const group of groups) {
    const note = edit.notes.find((n) => n.n === group.note);
    if (!note) {
      problems.push(`edit "${edit.id}": no note ${group.note}`);
      continue;
    }
    const a = words(group.text).length;
    const b = noteWords(note).length;
    if (a !== b) problems.push(`edit "${edit.id}" note ${group.note}: ${a} jargon words but ${b} note words`);
  }
  // A reference must follow a word, never open the copy.
  if (typeof edit.fair[0] !== "string") problems.push(`edit "${edit.id}": the fair copy opens with a reference`);
}

/**
 * Fails the prerender (and so the build) if an edit's words cannot be
 * paired, an Index entry cites a page that does not carry its term, a page
 * number is unknown, or a contact channel is missing.
 */
export function validateContent() {
  const problems: string[] = [];
  const edits = [PLAIN_WORDS.edit, AWAY.edit, ...LEAVES.flatMap((l) => (l.edit ? [l.edit] : []))];
  edits.forEach((e) => checkEdit(e, problems));

  const texts = pageTexts();
  const folios = new Set(PAGES.map((p) => p.folio));
  const check = (term: string, pages: number[], match?: string) => {
    for (const folio of pages) {
      if (!folios.has(folio)) problems.push(`index "${term}": no page ${folio}`);
      const text = texts.get(folio) ?? "";
      if (!text.toLowerCase().includes((match ?? term).toLowerCase())) {
        problems.push(`index "${term}": page ${folio} does not mention "${match ?? term}"`);
      }
    }
  };
  for (const column of INDEX) {
    for (const entry of column.entries) {
      check(entry.term, entry.pages, entry.match);
      for (const sub of entry.sub ?? []) check(`${entry.term} ${sub.term}`, sub.pages, sub.match);
    }
  }

  const required = ["mailto:", "tel:", "linkedin.com", "github.com", "instagram.com"];
  for (const r of required) if (!CONTACTS.some((c) => c.href.includes(r))) problems.push(`contact ${r} missing`);

  if (problems.length) throw new Error(`Content does not validate:\n- ${problems.join("\n- ")}`);
}
