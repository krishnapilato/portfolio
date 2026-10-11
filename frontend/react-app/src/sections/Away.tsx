import { useRef } from "react";
import { AWAY } from "../content/copy";
import { buildEdit, settleEdit } from "../motion/edit";
import { gsap } from "../motion/gsap";
import { drawMark } from "../motion/mark";
import { setDraft, setLines, setNotes, setToken } from "../motion/reveal";
import { useSection } from "../motion/useSection";
import Edit from "../ui/Edit";
import Folio from "../ui/Folio";
import Notes from "../ui/Notes";
import { Mark, Prose } from "../ui/text";

/**
 * Folio 16. Aviation as plain content, told in sentences with nothing
 * themed: the same book parts as everywhere else. The logbook facts sit in
 * a note, and the one method in his note on simulator trim is the last
 * edit of the book.
 */
export default function Away() {
  const ref = useRef<HTMLElement>(null);

  useSection(ref, ({ root, mode }) => {
    const q = gsap.utils.selector(root);
    const edit = q(".edit")[0] as HTMLElement;
    if (mode === "still") {
      settleEdit(edit, root);
      return;
    }
    const at = (el: Element, start = "top 85%") => ({ trigger: el, start });
    const h2 = q(".chapter")[0];
    setLines(h2, "display", { trigger: at(h2, "top 82%") });
    setLines(q(".away__lead"), "body", { trigger: at(h2, "top 82%"), delay: 0.3 });
    const body = q(".away__body")[0];
    setLines(body, "body", { trigger: at(body) });
    drawMark(body.querySelector(".mark"), { trigger: at(body), delay: 1.1 });
    setDraft(q(".edit__draft")[0], { trigger: at(edit) });
    buildEdit(edit, {
      scope: root,
      notesRule: q(".prose__rule")[0],
      closeUp: { targets: q(".away__closing, .prose__foot, .prose__folio"), direction: -1 },
      scrollTrigger: { trigger: edit, start: mode === "wide" ? "top 58%" : "top 62%", end: mode === "wide" ? "top 22%" : "top 26%" },
    });
    setLines(q(".away__closing"), "body", { trigger: at(q(".away__closing")[0]) });
    setNotes(q(".notes .note[data-reveal]"), { trigger: at(q(".prose__foot")[0], "top 92%") });
    setToken(q(".folio"), { trigger: at(q(".folio")[0], "top 95%") });
  });

  return (
    <section id="away" className="page prose away" aria-labelledby="away-h" ref={ref}>
      <div className="wrap grid prose__grid">
        <div className="prose__main">
          <h2 id="away-h" className="chapter" data-reveal="">
            {AWAY.heading}
          </h2>
          <p className="plain away__lead" data-reveal="">
            {AWAY.lead}
          </p>
          <p className="body away__body" data-reveal="">
            <Prose parts={AWAY.body} />
            <Mark>{AWAY.bodyMark}</Mark>
          </p>
          <Edit edit={AWAY.edit} className="away__edit" />
          <p className="body away__closing" data-reveal="">
            {AWAY.closing}
          </p>
        </div>
        <div className="prose__foot">
          <span className="rule prose__rule" aria-hidden="true" data-rule="" />
          <Notes
            notes={[...AWAY.notes.map((note) => ({ note })), ...AWAY.edit.notes.map((note) => ({ note, edit: AWAY.edit.id }))]}
          />
        </div>
        <Folio n={16} className="prose__folio" />
      </div>
    </section>
  );
}
