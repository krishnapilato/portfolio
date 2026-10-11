import { useRef, useState } from "react";
import { CONTACTS, CORRESPONDENCE } from "../content/copy";
import { gsap } from "../motion/gsap";
import { setLines, setToken } from "../motion/reveal";
import { drawRule } from "../motion/rules";
import { useSection } from "../motion/useSection";
import CopyButton from "../ui/CopyButton";
import Folio from "../ui/Folio";

/**
 * Folio 18. The rule that ran through the book ends as five ruled lines
 * that lead to him; the last rule, after the colophon, is non-repro blue
 * and stops partway: the next page is not written yet.
 */
export default function Correspondence() {
  const ref = useRef<HTMLElement>(null);
  const [message, setMessage] = useState({ text: "", key: 0 });

  useSection(ref, ({ root, mode }) => {
    if (mode === "still") return;
    const q = gsap.utils.selector(root);
    const trigger = { trigger: root, start: "top 70%" };
    setLines(q(".chapter"), "display", { trigger });
    setLines(q(".cx__lead"), "body", { trigger, delay: 0.3 });
    q(".cx__row").forEach((row, k) => {
      const base = 0.6 + 0.12 * k;
      drawRule(row.querySelector(".cx__rule"), { trigger, delay: base, duration: 0.7 });
      setLines(row.querySelector(".cx__label"), "note", { trigger, delay: base + 0.25 });
      setLines(row.querySelector(".cx__value"), "body", { trigger, delay: base + 0.25 });
      setToken(row.querySelector(".copy"), { trigger, delay: base + 0.4 });
    });
    setLines(q(".cx__colophon"), "note", { trigger, delay: 1.6 });
    drawRule(q(".cx__end")[0], { trigger, delay: 1.9, duration: 1.2, to: 0.4 });
    setToken(q(".folio"), { trigger, delay: 2 });
  });

  return (
    <section id="correspondence" className="page cx" aria-labelledby="correspondence-h" ref={ref}>
      <div className="wrap">
        <h2 id="correspondence-h" className="chapter" data-reveal="" tabIndex={-1}>
          {CORRESPONDENCE.heading}
        </h2>
        <p className="plain cx__lead" data-reveal="">
          {CORRESPONDENCE.lead}
        </p>
        <ul className="cx__rows">
          {CONTACTS.map((contact) => {
            const valueId = `cx-${contact.label.toLowerCase()}`;
            return (
              <li className="cx__row" key={contact.label}>
                <span className="rule cx__rule" aria-hidden="true" data-rule="" />
                <span className="label cx__label" aria-hidden="true" data-reveal="">
                  {contact.label}
                </span>
                <a className="cx__link" href={contact.href}>
                  <span className="sr-only">{contact.label} </span>
                  <span className="cx__value" id={valueId} data-reveal="">
                    {contact.value}
                  </span>
                </a>
                {contact.copy ? (
                  <CopyButton
                    value={contact.copy}
                    noun={contact.noun ?? contact.label.toLowerCase()}
                    valueId={valueId}
                    onAnnounce={(text) => setMessage((m) => ({ text, key: m.key + 1 }))}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="note-text cx__colophon" data-reveal="">
          {CORRESPONDENCE.colophon}
        </p>
        <span className="wash cx__end" aria-hidden="true" data-rule="" />
        <Folio n={18} className="cx__folio" />
        <span className="sr-only" role="status" aria-live="polite" key={message.key}>
          {message.text}
        </span>
      </div>
    </section>
  );
}
