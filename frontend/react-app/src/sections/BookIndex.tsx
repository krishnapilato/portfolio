import { Fragment, useRef } from "react";
import { INDEX_PAGE } from "../content/copy";
import { pageByFolio } from "../content/folios";
import { INDEX, type IndexEntry } from "../content/indexTerms";
import { onCut } from "../motion/cut";
import { gsap } from "../motion/gsap";
import { setLines, setToken } from "../motion/reveal";
import { useSection } from "../motion/useSection";
import Folio from "../ui/Folio";

function Pages({ pages }: { pages: number[] }) {
  return (
    <span className="ix__pages">
      {pages.map((folio, i) => {
        const page = pageByFolio(folio);
        return (
          <Fragment key={folio}>
            {i > 0 ? ", " : " "}
            <a className="ix__folio" href={`#${page.id}`} aria-label={`Page ${folio}, ${page.title}`} onClick={(event) => onCut(event, page.id)}>
              {folio}
            </a>
          </Fragment>
        );
      })}
    </span>
  );
}

function Entry({ entry }: { entry: IndexEntry }) {
  return (
    <li className="ix__entry">
      <span className="ix__term">{entry.term}</span>
      <Pages pages={entry.pages} />
      {entry.sub ? (
        <ul className="ix__sub">
          {entry.sub.map((sub) => (
            <li className="ix__entry" key={sub.term}>
              <span className="ix__term">{sub.term}</span>
              <Pages pages={sub.pages} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Folio 17. A back-of-book index: still on purpose (an index is scanned,
 * not watched), and every page number is a link that jumps to its page.
 */
export default function BookIndex() {
  const ref = useRef<HTMLElement>(null);
  useSection(ref, ({ root, mode }) => {
    if (mode === "still") return;
    const q = gsap.utils.selector(root);
    const head = q(".chapter")[0];
    setLines(head, "display", { trigger: { trigger: head, start: "top 82%" } });
    setLines(q(".ix__lead"), "body", { trigger: { trigger: head, start: "top 82%" }, delay: 0.3 });
    q(".ix__col").forEach((col, i) => {
      const trigger = { trigger: col, start: "top 88%" };
      setLines(col.querySelector(".ix__title"), "note", { trigger, delay: 0.05 * i });
      const entries = Array.from(col.querySelectorAll(":scope > ul > .ix__entry"));
      gsap.fromTo(
        entries,
        { opacity: 0, visibility: "visible" },
        { opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.025, delay: 0.15 + 0.05 * i, scrollTrigger: { ...trigger, toggleActions: "play none none reverse" } },
      );
    });
    setToken(q(".folio"), { trigger: { trigger: q(".folio")[0], start: "top 95%" } });
  });

  return (
    <section id="index" className="page ix" aria-labelledby="index-h" ref={ref}>
      <div className="wrap">
        <h2 id="index-h" className="chapter" data-reveal="">
          {INDEX_PAGE.heading}
        </h2>
        <p className="plain ix__lead" data-reveal="">
          {INDEX_PAGE.lead}
        </p>
        <div className="ix__cols">
          {INDEX.map((column) => (
            <div className="ix__col" key={column.title}>
              <h3 className="label ix__title" data-reveal="">
                {column.title}
              </h3>
              <ul>
                {column.entries.map((entry) => (
                  <Entry entry={entry} key={entry.term} />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Folio n={17} className="ix__folio-n" />
      </div>
    </section>
  );
}
