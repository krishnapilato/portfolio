import type { ReactNode } from "react";
import { words, type EditCopy } from "../content/copy";
import { spaced } from "./spaced";
import { Ref } from "./text";

/**
 * One edit: the crowded draft (shown first, hidden from screen readers and
 * search snippets) over its fair copy (the real text), in the same grid
 * cell. Words are separate spans because the edit moves them one by one;
 * the draft's words sit in masks so they can be set like the rest of the
 * book. The cell is always as tall as the draft, so nothing below it moves.
 */
export default function Edit({ edit, className = "" }: { edit: EditCopy; className?: string }) {
  const draft: ReactNode[] = [];
  edit.draft.forEach((part, pi) => {
    if (typeof part === "string") {
      words(part).forEach((word, wi) =>
        draft.push(
          <span className="wm" key={`${pi}-${wi}`}>
            <span className="w">{word}</span>
          </span>,
        ),
      );
    } else {
      draft.push(
        <span className="jargon" data-note={part.note} key={`g${pi}`}>
          {spaced(
            words(part.text).map((word, wi) => (
              <span className="wm" key={wi}>
                <span className="w j">{word}</span>
              </span>
            )),
          )}
        </span>,
      );
    }
  });

  // Fair copy: a reference rides on the word before it.
  const fair: ReactNode[] = [];
  const markWords = edit.mark ? words(edit.mark) : [];
  const plain = edit.fair.flatMap((part, pi) =>
    typeof part === "string" ? words(part).map((w) => ({ w, ref: 0, key: pi })) : [],
  );
  let wordIndex = -1;
  edit.fair.forEach((part) => {
    if (typeof part === "string") {
      words(part).forEach(() => {
        wordIndex += 1;
      });
    } else if (wordIndex >= 0) {
      plain[wordIndex].ref = part.ref;
    }
  });
  const markStart = markWords.length ? plain.length - markWords.length : plain.length;
  const node = (item: (typeof plain)[number], i: number) => (
    <span className="fw" key={i}>
      {item.w}
      {item.ref ? <Ref n={item.ref} /> : null}
    </span>
  );
  plain.slice(0, markStart).forEach((item, i) => fair.push(node(item, i)));
  if (markStart < plain.length) {
    fair.push(
      <span className="mark" key="mark">
        <span className="mark__text">{spaced(plain.slice(markStart).map((item, i) => node(item, markStart + i)))}</span>
        <span className="mark__rule" aria-hidden="true" />
      </span>,
    );
  }

  return (
    <div className={`edit ${className}`} data-edit={edit.id}>
      <p className="edit__draft plain" aria-hidden="true" data-nosnippet="">
        {spaced(draft)}
      </p>
      <p className="edit__fair plain">{spaced(fair)}</p>
    </div>
  );
}
