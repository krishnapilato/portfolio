import { useRef } from "react";
import { TITLE } from "../content/copy";
import { CONTENTS } from "../content/folios";
import { onCut } from "../motion/cut";
import { gsap } from "../motion/gsap";
import { drawMark } from "../motion/mark";
import { setLines } from "../motion/reveal";
import { drawRule } from "../motion/rules";
import { useSection } from "../motion/useSection";
import { Mark } from "../ui/text";

/**
 * Folio 1. The name is printed from the HTML and never animated (it is the
 * first thing painted). The three headline lines are set onto the page,
 * the present tense gets the pencil, and on the way out the past leaves
 * first while the present stays longest.
 */
export default function TitlePage() {
  const ref = useRef<HTMLElement>(null);

  useSection(ref, ({ root, mode }) => {
    if (mode === "still") return;
    const q = gsap.utils.selector(root);
    const lines = q(".hl");
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(lines, { yPercent: 105, visibility: "visible" }, { yPercent: 0, duration: 1.15, ease: "settle", stagger: 0.11 }, 0);
    const mark = drawMark(q(".headline .mark")[0], { duration: 0.8 });
    if (mark) tl.add(mark, 1.1);
    setLines(q(".title__label"), "note", { delay: 0.1 });
    setLines(q(".title__sub"), "body", { delay: 1.45 });
    drawRule(q(".contents__rule"), { delay: 1.55, duration: 0.5 });
    setLines(q(".contents__label"), "note", { delay: 1.6 });
    const rows = q(".contents__row");
    gsap.fromTo(
      rows,
      { yPercent: 105, visibility: "visible" },
      {
        yPercent: 0,
        duration: 0.6,
        ease: "settle",
        stagger: 0.04,
        delay: 1.7,
        onComplete: () => gsap.set(q(".contents__item"), { overflow: "visible" }),
      },
    );

    if (mode === "short") return;
    // The exit: the past leaves first, the present stays longest.
    const depth = [0.22, 0.12, 0.04];
    q(".hl-mask").forEach((mask, i) =>
      gsap.to(mask, {
        y: () => -depth[i] * window.innerHeight,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
      }),
    );
  });

  return (
    <section id="title" className="page title" aria-labelledby="title-h" ref={ref}>
      <div className="wrap grid title__grid">
        <p className="label title__label" data-reveal="">
          {TITLE.label}
        </p>
        <h1 id="title-h" className="title__name">
          <span className="title__line">{TITLE.nameLines[0]}</span>{" "}
          <span className="title__line">{TITLE.nameLines[1]}</span>
        </h1>
        <p className="headline">
          {TITLE.headline.map((line, i) => (
            <span key={line}>
              {i > 0 ? " " : null}
              <span className="hl-mask">
                <span className="hl">{i === TITLE.headline.length - 1 ? <Mark>{line}</Mark> : line}</span>
              </span>
            </span>
          ))}
        </p>
        <p className="title__sub" data-reveal="">
          {TITLE.subline}
        </p>
        <nav className="contents" aria-label="Contents">
          <span className="rule contents__rule" aria-hidden="true" data-rule="" />
          <p className="label contents__label" data-reveal="" aria-hidden="true">
            {TITLE.contentsLabel}
          </p>
          <ol className="contents__list">
            {CONTENTS.map((page) => (
              <li className="contents__item" key={page.id}>
                <a className="contents__row" href={`#${page.id}`} onClick={(event) => onCut(event, page.id)}>
                  <span className="contents__title">{page.title}</span>
                  <span className="contents__leader" aria-hidden="true" />
                  <span className="contents__folio">
                    <span className="sr-only">page </span>
                    {page.folio}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
