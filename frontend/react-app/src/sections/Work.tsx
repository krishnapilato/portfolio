import { useRef } from "react";
import { PLATES, WORK, type Plate as PlateCopy } from "../content/copy";
import { gsap } from "../motion/gsap";
import { drawMark } from "../motion/mark";
import { registration } from "../motion/register";
import { setLines, setNotes, setToken } from "../motion/reveal";
import { drawRule } from "../motion/rules";
import { useSection, type Build } from "../motion/useSection";
import Folio from "../ui/Folio";
import { Mark, Prose } from "../ui/text";
import BiMapFigure from "./figures/BiMapFigure";
import PixelPaperFigure from "./figures/PixelPaperFigure";
import { LINES_CROOKED, LINES_UPRIGHT, PAGE_CROOKED, PAGE_UPRIGHT } from "./figures/pixelpaper";
import SiteFigure from "./figures/SiteFigure";

const FIGURES = { bimap: BiMapFigure, pixelpaper: PixelPaperFigure, "this-site": SiteFigure };

/** The drawing of each plate, scrubbed: it completes as its words settle, and undraws on the way back. */
function figureTimeline(plate: PlateCopy["id"], svg: SVGSVGElement) {
  const q = gsap.utils.selector(svg);
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  if (plate === "bimap") {
    tl.fromTo(q(".fig__region"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.3 }, 0)
      .fromTo(q(".fig__stem"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.2, stagger: 0.06 }, 0.25)
      .fromTo(q(".fig__bracket"), { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: 0.2, stagger: 0.06 }, 0.38)
      .fromTo(q(".fig__dot"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.1, stagger: { amount: 0.3 } }, 0.6)
      .fromTo(q(".fig__muni"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.12, stagger: { amount: 0.3 } }, 0.62);
  } else if (plate === "pixelpaper") {
    gsap.set(q(".fig__ghost"), { autoAlpha: 0 });
    const lines = q(".fig__text");
    tl.fromTo(q(".fig__page"), { attr: { points: PAGE_CROOKED } }, { attr: { points: PAGE_UPRIGHT }, duration: 0.55, ease: "power2.inOut" }, 0);
    lines.forEach((line, i) => {
      const [x1, y1, x2, y2] = LINES_CROOKED[i];
      const [u1, v1, u2, v2] = LINES_UPRIGHT[i];
      tl.fromTo(line, { attr: { x1, y1, x2, y2 } }, { attr: { x1: u1, y1: v1, x2: u2, y2: v2 }, duration: 0.55, ease: "power2.inOut" }, 0);
    });
    // Enhanced: the faint photographed text becomes ink.
    tl.fromTo(lines, { stroke: "#9db8e2" }, { stroke: "#44434b", duration: 0.3 }, 0.3);
    // Collated: 3·1·2 becomes 1·2·3.
    const [t1, t2, t3] = [1, 2, 3].map((k) => q(`[data-tile="${k}"]`)[0]);
    tl.fromTo(t3, { x: -120, y: 0 }, { y: -84, duration: 0.08, ease: "power2.inOut" }, 0.6)
      .to(t3, { x: 0, duration: 0.16, ease: "power2.inOut" }, 0.66)
      .fromTo([t1, t2], { x: 60 }, { x: 0, duration: 0.14, ease: "power2.inOut" }, 0.68)
      .to(t3, { y: 0, duration: 0.1, ease: "power2.inOut" }, 0.8);
  } else {
    tl.fromTo(q(".fig__outline"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.3, stagger: 0.04 }, 0)
      .fromTo(q(".fig__line"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.12, stagger: 0.03 }, 0.2)
      .fromTo(q(".fig__noteline"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.1, stagger: 0.03 }, 0.6)
      .fromTo(q(".fig__printed"), { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.2, ease: "pencil" }, 0.8);
  }
  return tl;
}

/**
 * One plate: a book spread with the drawing on the left page (verso) and
 * the words on the right (recto). Crop marks mean ready for press, i.e.
 * shipped. The plate numeral drifts behind the drawing, in register when
 * the plate is read.
 */
function Plate({ plate }: { plate: PlateCopy }) {
  const ref = useRef<HTMLElement>(null);
  const Figure = FIGURES[plate.id];

  const build: Build = ({ root, mode }) => {
    if (mode === "still") return;
    const q = gsap.utils.selector(root);
    const trigger = { trigger: root, start: "top 70%" };
    drawRule(q(".crop i"), { duration: 0.45, stagger: 0.04, trigger, origin: "0% 0%" });
    setLines(q(".plate__label"), "note", { trigger });
    setLines(q(".plate__title"), "display", { trigger, delay: 0.15 });
    drawMark(q(".plate__title .mark")[0], { trigger, delay: 1.2 });
    setLines(q(".plate__sentence"), "body", { trigger, delay: 0.5 });
    drawRule(q(".plate__rule")[0], { trigger, delay: 1.0, duration: 0.5 });
    setNotes(q(".plate__note"), { trigger, delay: 1.1 });
    setLines(q(".plate__source"), "note", { trigger, delay: 1.25 });
    setToken(q(".folio"), { trigger, delay: 1.3 });
    setLines(q(".plate__caption"), "note", { trigger: { trigger: q(".plate__figure")[0], start: "center 55%" } });
    if (mode !== "short") registration(q(".plate__numeral")[0], -0.2);
    const svg = q("svg")[0] as unknown as SVGSVGElement;
    const tl = figureTimeline(plate.id, svg);
    gsap.set(svg, { visibility: "visible" });
    gsap.timeline({
      scrollTrigger: { trigger: q(".plate__figure")[0], start: "top 78%", end: "center 48%", scrub: 0.6 },
    }).add(tl);
  };
  useSection(ref, build);

  return (
    <article className="plate" id={plate.id} aria-labelledby={`${plate.id}-h`} ref={ref}>
      <div className="wrap grid plate__grid">
        <figure className="plate__figure">
          <span className="ghost plate__numeral" aria-hidden="true">
            {plate.numeral}
          </span>
          <span className="crop" aria-hidden="true">
            <i className="crop__tl-h" />
            <i className="crop__tl-v" />
            <i className="crop__tr-h" />
            <i className="crop__tr-v" />
            <i className="crop__bl-h" />
            <i className="crop__bl-v" />
            <i className="crop__br-h" />
            <i className="crop__br-v" />
          </span>
          <Figure label={plate.figureLabel} />
          <figcaption className="plate__caption note-text" data-reveal="">
            {plate.caption}
          </figcaption>
        </figure>
        <div className="plate__text">
          <p className="label plate__label" data-reveal="">
            {plate.label}
          </p>
          <h3 id={`${plate.id}-h`} className="plate__title" data-reveal="">
            <Mark>{plate.title}</Mark>
          </h3>
          <p className="plain plate__sentence" data-reveal="">
            <Prose parts={plate.sentence} />
          </p>
          <span className="rule plate__rule" aria-hidden="true" data-rule="" />
          <ol className="notes" aria-label="Notes">
            <li className="note plate__note" value={1} data-reveal="">
              <span className="note__n" aria-hidden="true">
                1
              </span>
              <span className="note__text">{plate.note}</span>
            </li>
          </ol>
          <p className="plate__source" data-reveal="">
            <a className="ul" href={plate.source}>
              Source on GitHub<span className="sr-only">: {plate.title}</span>
            </a>
          </p>
          <Folio n={plate.folio} className="plate__folio" />
        </div>
      </div>
    </article>
  );
}

/** Folios 13 to 15: three projects, each drawn as a plate; the stack is in the notes. */
export default function Work() {
  const ref = useRef<HTMLElement>(null);
  useSection(ref, ({ root, mode }) => {
    if (mode === "still") return;
    const q = gsap.utils.selector(root);
    const head = q(".work__head")[0];
    setLines(q(".work__head .chapter"), "display", { trigger: { trigger: head, start: "top 82%" } });
    setLines(q(".work__lead"), "body", { trigger: { trigger: head, start: "top 82%" }, delay: 0.3 });
    setLines(q(".work__also"), "body", { trigger: { trigger: q(".work__also")[0], start: "top 88%" } });
  });

  return (
    <section id="work" className="page work" aria-labelledby="work-h" ref={ref}>
      <div className="wrap work__head">
        <h2 id="work-h" className="chapter" data-reveal="">
          {WORK.heading}
        </h2>
        <p className="plain work__lead" data-reveal="">
          {WORK.lead}
        </p>
      </div>
      {PLATES.map((plate) => (
        <Plate plate={plate} key={plate.id} />
      ))}
      <div className="wrap">
        <p className="body work__also" data-reveal="">
          {WORK.also.before}
          {WORK.also.links.map((link) => (
            <span key={link.href}>
              <a className="ul" href={link.href}>
                {link.text}
              </a>
              {link.after}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

