import { Fragment, type ReactNode } from "react";
import type { FairPart } from "../content/copy";

/** A footnote reference: raised, pencil blue, silent for screen readers. */
export function Ref({ n }: { n: number }) {
  return (
    <sup className="ref" data-ref={n} aria-hidden="true">
      {n}
    </sup>
  );
}

/** A phrase underlined by the pencil. */
export function Mark({ children }: { children: ReactNode }) {
  return (
    <span className="mark">
      <span className="mark__text">{children}</span>
      <span className="mark__rule" aria-hidden="true" />
    </span>
  );
}

/**
 * Prose with footnote references, as plain text. `mark` underlines the
 * last occurrence of a phrase.
 */
export function Prose({ parts, mark }: { parts: FairPart[]; mark?: string }) {
  return (
    <>
      {parts.map((part, i) => {
        if (typeof part !== "string") return <Ref key={i} n={part.ref} />;
        const lead = i > 0 && typeof parts[i - 1] !== "string" ? " " : "";
        if (mark && part.endsWith(mark)) {
          return (
            <Fragment key={i}>
              {lead}
              {part.slice(0, part.length - mark.length)}
              <Mark>{mark}</Mark>
            </Fragment>
          );
        }
        return (
          <Fragment key={i}>
            {lead}
            {part}
          </Fragment>
        );
      })}
    </>
  );
}

