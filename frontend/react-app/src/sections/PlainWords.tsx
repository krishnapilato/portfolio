import { useRef } from "react";
import { PLAIN_WORDS } from "../content/copy";
import { buildEdit, settleEdit } from "../motion/edit";
import { gsap } from "../motion/gsap";
import { drawMark } from "../motion/mark";
import { registration } from "../motion/register";
import { setDraft, setLines, setToken } from "../motion/reveal";
import { useSection } from "../motion/useSection";
import Edit from "../ui/Edit";
import Folio from "../ui/Folio";
import Notes from "../ui/Notes";

/**
 * Folio 3. The first edit, taught slowly: the margin says Draft, the
 * crowded sentence of every tool he uses is set, and as you read on the
 * tools are lifted out into one note and the sentence that is left is the
 * one a person can read. The margin says Fair copy. Scroll back up and the
 * draft returns.
 */
export default function PlainWords() {
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
    const label = q(".prose__label")[0];
    gsap.fromTo(
      label.firstElementChild,
      { yPercent: 105, visibility: "visible" },
      { yPercent: 0, duration: 0.6, ease: "settle", delay: 0.2, scrollTrigger: { ...at(h2, "top 82%"), toggleActions: "play none none reverse" } },
    );
    gsap.set(label, { visibility: "visible" });
    setDraft(q(".edit__draft")[0], { trigger: at(edit) });
    buildEdit(edit, {
      scope: root,
      label,
      notesRule: q(".prose__rule")[0],
      closeUp: { targets: q(".prose__body, .prose__foot, .prose__folio"), direction: -1 },
      scrollTrigger: { trigger: edit, start: mode === "wide" ? "top 58%" : "top 62%", end: mode === "wide" ? "top 18%" : "top 22%" },
    });
    drawMark(edit.querySelector(".edit__fair .mark"), { trigger: { trigger: edit, start: mode === "wide" ? "top 18%" : "top 22%" }, delay: 0.5 });
    setLines(q(".prose__body"), "body", { trigger: at(q(".prose__body")[0]) });
    const side = q(".sidenote")[0];
    setLines(side, "note", { trigger: at(side), delay: 0.2 });
    if (mode === "wide") registration(side, 0.1);
    setToken(q(".folio"), { trigger: at(q(".folio")[0], "top 95%") });
  });

  return (
    <section id="plain-words" className="page prose" aria-labelledby="plain-words-h" ref={ref}>
      <div className="wrap grid prose__grid">
        <div className="prose__margin" aria-hidden="true">
          <span className="swap label prose__label">
            <span>{PLAIN_WORDS.labelDraft}</span>
            <span>{PLAIN_WORDS.labelFair}</span>
          </span>
        </div>
        <div className="prose__main">
          <h2 id="plain-words-h" className="chapter" data-reveal="">
            {PLAIN_WORDS.heading}
          </h2>
          <Edit edit={PLAIN_WORDS.edit} className="prose__edit" />
          <p className="body prose__body" data-reveal="">
            {PLAIN_WORDS.body}
          </p>
        </div>
        <p className="sidenote note-text" data-reveal="">
          {PLAIN_WORDS.sidenote}
        </p>
        <div className="prose__foot">
          <span className="rule prose__rule" aria-hidden="true" data-rule="" />
          <Notes notes={PLAIN_WORDS.edit.notes.map((note) => ({ note }))} edit={PLAIN_WORDS.edit.id} />
        </div>
        <Folio n={3} className="prose__folio" />
      </div>
    </section>
  );
}
