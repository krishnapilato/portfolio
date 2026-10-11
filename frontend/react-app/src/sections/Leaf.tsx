import type { Leaf as LeafCopy } from "../content/copy";
import Edit from "../ui/Edit";
import Folio from "../ui/Folio";
import Notes from "../ui/Notes";
import { Prose } from "../ui/text";

/**
 * One page of the fold-out: the plain sentence above the long footnote
 * rule, the detail below it, the folio at the foot.
 */
export default function Leaf({ leaf }: { leaf: LeafCopy }) {
  const notes = leaf.edit?.notes ?? leaf.notes ?? [];
  return (
    <li className={`leaf${leaf.tipped ? " leaf--tipped" : ""}`} id={leaf.id}>
      <div className="leaf__above">
        <p className="label leaf__label" data-reveal="">
          {leaf.label}
        </p>
        <h3 className="leaf__title" data-reveal="">
          {leaf.title}
        </h3>
        {leaf.role ? (
          <p className="leaf__role" data-reveal="">
            {leaf.role}
          </p>
        ) : null}
        {leaf.edit ? (
          <Edit edit={leaf.edit} className="leaf__edit" />
        ) : (
          <p className="plain leaf__sentence" data-reveal="">
            <Prose parts={leaf.sentence ?? []} />
          </p>
        )}
      </div>
      <div className="leaf__below">
        {leaf.tipped ? <span className="leaf__hang" aria-hidden="true" /> : null}
        {notes.length ? <Notes notes={notes.map((note) => ({ note }))} edit={leaf.edit?.id} /> : null}
      </div>
      <Folio n={leaf.folio} className="leaf__folio" />
    </li>
  );
}
