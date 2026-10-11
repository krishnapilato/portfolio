import { words, type Note } from "../content/copy";
import { spaced } from "./spaced";

/**
 * A footnote list. Notes filled by an edit carry their words as separate
 * spans (the jargon lands on them) and wait for the edit; other notes are
 * plain text set like any other line.
 */
export default function Notes({ notes, edit, className = "" }: { notes: { note: Note; edit?: string }[]; edit?: string; className?: string }) {
  return (
    <ol className={`notes ${className}`} aria-label="Notes">
      {notes.map(({ note, edit: from = edit }) => {
        const lines = Array.isArray(note.text) ? note.text : [note.text];
        return (
          <li className="note" key={note.n} value={note.n} data-edit-note={from} data-reveal={from ? undefined : ""}>
            <span className="note__n" aria-hidden="true">
              {note.n}
            </span>
            <span className="note__text">
              {from
                ? lines.map((line, li) => (
                    <span className="note__line" key={li}>
                      {spaced(words(line).map((w, wi) => <span className="nw" key={wi}>{w}</span>))}
                    </span>
                  ))
                : lines.map((line, li) => (
                    <span className="note__line" key={li}>
                      {line}
                    </span>
                  ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
