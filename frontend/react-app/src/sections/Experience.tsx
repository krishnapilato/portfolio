import { useRef } from "react";
import { EXPERIENCE, LEAVES, NEXT_LEAF } from "../content/copy";
import { cutTo, onCut } from "../motion/cut";
import { buildEdit, settleEdit } from "../motion/edit";
import { gsap, ScrollTrigger } from "../motion/gsap";
import { registration } from "../motion/register";
import { setDraft, setLines, setNotes, setToken } from "../motion/reveal";
import { drawRule } from "../motion/rules";
import { useSection } from "../motion/useSection";
import Folio from "../ui/Folio";
import SkipLink from "../ui/SkipLink";
import Leaf from "./Leaf";

/**
 * Folios 4 to 12. The career as a fold-out of pages. On a wide screen the
 * pages travel sideways as you scroll (sideways is time); one long
 * footnote rule runs under every page with the plain sentences above it
 * and the detail below it, printed in pencil only as far as you have read
 * and never past today. After today it is non-repro blue: not printed yet.
 * On a phone the same pages stack in a column and the rule is a spine.
 */
export default function Experience() {
  const ref = useRef<HTMLElement>(null);

  useSection(ref, ({ root, mode, safe }) => {
    const q = gsap.utils.selector(root);
    const leaves = q(".leaf") as HTMLElement[];
    const edits = q(".edit") as HTMLElement[];
    const scopeOf = (el: Element) => el.closest(".leaf") as HTMLElement;
    if (mode === "still") {
      edits.forEach((edit) => settleEdit(edit, scopeOf(edit)));
      return;
    }

    if (mode === "wide") return buildPassage(root, q, leaves, safe);

    // Narrow and short: a column with a spine.
    const track = q(".xp__track")[0] as HTMLElement;
    const atm = q("#atm")[0] as HTMLElement;
    const measure = () => {
      const first = leaves[0];
      const top = first.offsetTop;
      const today = atm.offsetTop + atm.offsetHeight;
      gsap.set(q(".xp__spine-printed"), { top, height: today - top });
      gsap.set(q(".xp__spine-wash"), { top: today, height: Math.max(0, track.offsetHeight - today) });
    };
    ScrollTrigger.addEventListener("refreshInit", measure);
    measure();
    gsap.fromTo(
      q(".xp__spine-printed"),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        transformOrigin: "50% 0%",
        scrollTrigger: { trigger: leaves[0], start: "top 60%", endTrigger: atm, end: "bottom 60%", scrub: 0.5, invalidateOnRefresh: true },
      },
    );
    leaves.forEach((leaf) => revealLeaf(leaf, (el, start) => ({ trigger: el, start: start.vertical })));
    edits.forEach((edit) => {
      const leaf = scopeOf(edit);
      buildEdit(edit, {
        scope: leaf,
        closeUp: { targets: Array.from(leaf.querySelectorAll(".leaf__below, .leaf__folio")), direction: -1 },
        scrollTrigger: { trigger: edit, start: "top 64%", end: "top 28%" },
      });
    });
    if (mode === "narrow") {
      q(".xp__year").forEach((year) => {
        registration(year, -0.15);
        gsap.fromTo(year, { x: "8vw" }, {
          x: "-8vw",
          ease: "none",
          scrollTrigger: { trigger: year.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 },
        });
      });
    }
    return () => ScrollTrigger.removeEventListener("refreshInit", measure);
  });

  return (
    <section id="experience" className="page xp" aria-labelledby="experience-h" ref={ref}>
      <SkipLink to="work" className="skip--inline">
        Skip past Experience
      </SkipLink>
      <div className="xp__stage">
        <p className="label stage-label xp__label" aria-hidden="true">
          {EXPERIENCE.stageLabel}
        </p>
        <div className="xp__years" aria-hidden="true">
          {LEAVES.filter((leaf) => leaf.year).map((leaf) => (
            <span className="ghost xp__year" data-for={leaf.id} key={leaf.id}>
              {leaf.year}
            </span>
          ))}
        </div>
        <div className="xp__track">
          <div className="xp__rule" aria-hidden="true">
            <span className="rule xp__printed" />
            <span className="wash xp__wash" />
            <span className="xp__today">
              <span className="xp__tick" />
              <span className="label xp__today-label">{EXPERIENCE.todayLabel}</span>
            </span>
          </div>
          <span className="xp__spine" aria-hidden="true">
            <span className="rule xp__spine-printed" />
            <span className="wash xp__spine-wash" />
          </span>
          <ol className="xp__leaves">
            <li className="leaf leaf--opening">
              <div className="leaf__above">
                <h2 id="experience-h" className="chapter" data-reveal="">
                  {EXPERIENCE.heading}
                </h2>
                <p className="plain leaf__sentence" data-reveal="">
                  {EXPERIENCE.lead}
                </p>
              </div>
              <div className="leaf__below">
                <p className="note-text leaf__aside" data-reveal="">
                  {EXPERIENCE.aside}
                </p>
              </div>
              <Folio n={4} className="leaf__folio" />
            </li>
            {LEAVES.map((leaf) => (
              <Leaf leaf={leaf} key={leaf.id} />
            ))}
            <li className="leaf leaf--next" id={NEXT_LEAF.id}>
              <div className="leaf__above">
                <p className="label leaf__label" data-reveal="">
                  {NEXT_LEAF.label}
                </p>
                <h3 className="leaf__title" data-reveal="">
                  {NEXT_LEAF.title}
                </h3>
                <p className="plain leaf__sentence" data-reveal="">
                  {NEXT_LEAF.sentence}
                </p>
              </div>
              <div className="leaf__below">
                <p className="leaf__next" data-reveal="">
                  <a className="ul" href="#correspondence" onClick={(event) => onCut(event, "correspondence")}>
                    {NEXT_LEAF.link}
                  </a>
                </p>
              </div>
              <Folio n={NEXT_LEAF.folio} className="leaf__folio" />
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

type Starts = { vertical: string; horizontal: string };
type TriggerFor = (el: Element, start: Starts) => ScrollTrigger.Vars;

/** Label, title, role, then the sentence or draft, then plain notes: one page being set. */
function revealLeaf(leaf: HTMLElement, at: TriggerFor) {
  const start = { vertical: "top 80%", horizontal: "left 78%" };
  const trigger = at(leaf, start);
  const one = (sel: string) => leaf.querySelector(sel);
  setLines(one(".leaf__label"), "note", { trigger });
  setLines(one(".leaf__title, .chapter"), leaf.classList.contains("leaf--opening") ? "display" : "body", { trigger, delay: 0.12 });
  setLines(one(".leaf__role"), "note", { trigger, delay: 0.3 });
  setLines(one(".leaf__sentence"), "body", { trigger, delay: 0.42 });
  setDraft(one(".edit__draft"), { trigger, delay: 0.42 });
  setNotes(leaf.querySelectorAll(".note[data-reveal]"), { trigger, delay: 1.0 });
  setLines(Array.from(leaf.querySelectorAll(".leaf__aside, .leaf__next")), "note", { trigger, delay: 1.0 });
  setToken(one(".leaf__folio"), { trigger, delay: 1.1 });
  const hang = one(".leaf__hang");
  if (hang) drawRule(hang, { axis: "y", origin: "50% 0%", trigger, delay: 0.2, duration: 0.45 });
}

/** The wide passage: a sticky stage, a track that travels sideways, and everything registered to it. */
function buildPassage(root: HTMLElement, q: (s: string) => Element[], leaves: HTMLElement[], safe: <F extends (...a: never[]) => unknown>(f: F) => F) {
  const stage = q(".xp__stage")[0] as HTMLElement;
  const track = q(".xp__track")[0] as HTMLElement;
  const atm = q("#atm")[0] as HTMLElement;
  const opening = q(".leaf--opening")[0] as HTMLElement;
  const years = q(".xp__year") as HTMLElement[];
  const html = document.documentElement;
  html.classList.add("is-passage");

  const dist = () => Math.max(0, track.scrollWidth - stage.clientWidth);
  let startX = 0;
  let todayX = 0;
  let half = 0;
  // Layout is read here only (on refresh), never while scrubbing.
  const measure = () => {
    half = stage.clientWidth / 2;
    startX = opening.offsetLeft + 24;
    todayX = atm.offsetLeft + atm.offsetWidth;
    gsap.set(q(".xp__printed"), { left: startX, width: todayX - startX });
    gsap.set(q(".xp__wash"), { left: todayX, width: Math.max(0, track.scrollWidth - todayX) });
    gsap.set(q(".xp__today"), { left: todayX });
    for (const year of years) {
      const leaf = root.querySelector<HTMLElement>(`#${year.dataset.for}`);
      if (!leaf) continue;
      const cx = leaf.offsetLeft + leaf.offsetWidth / 2;
      gsap.set(year, { left: half + 0.8 * (cx - half) - year.offsetWidth / 2 });
    }
  };
  ScrollTrigger.addEventListener("refreshInit", measure);
  measure();

  const setPrinted = gsap.quickSetter(q(".xp__printed"), "scaleX");
  const setYears = gsap.quickSetter(q(".xp__years"), "x", "px");
  const passage = gsap.to(track, {
    x: () => -dist(),
    ease: "none",
    scrollTrigger: {
      id: "passage",
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onToggle: (self) => gsap.set([track, q(".xp__years")[0]], { willChange: self.isActive ? "transform" : "auto" }),
    },
    onUpdate() {
      const p = this.progress();
      const d = dist();
      setYears(-0.8 * d * p);
      setPrinted(gsap.utils.clamp(0, 1, (half + d * p - startX) / Math.max(1, todayX - startX)));
    },
  });

  // Pages already on screen when the stage arrives are set as it arrives;
  // the rest are set as they slide in.
  const visibleAtStart = (leaf: HTMLElement) => leaf.offsetLeft < stage.clientWidth * 0.78;
  const inPassage: TriggerFor = (el, start) =>
    visibleAtStart(el as HTMLElement)
      ? { trigger: root, start: "top 45%" }
      : { trigger: el, start: start.horizontal, containerAnimation: passage };
  leaves.forEach((leaf) => revealLeaf(leaf, inPassage));

  for (const leaf of leaves) {
    const edit = leaf.querySelector<HTMLElement>(".edit");
    if (edit) {
      buildEdit(edit, {
        scope: leaf,
        // On the page the sentence sits on the rule; its heading settles down onto it.
        closeUp: { targets: Array.from(leaf.querySelectorAll(".leaf__label, .leaf__title, .leaf__role")), direction: 1 },
        scrollTrigger: { trigger: leaf, containerAnimation: passage, start: "center 82%", end: "center 52%" },
      });
    }
    // Notes come into register under their sentence as the page reaches the middle.
    gsap.fromTo(leaf.querySelector(".leaf__below"), { x: 56 }, {
      x: -56,
      ease: "none",
      scrollTrigger: { trigger: leaf, containerAnimation: passage, start: "left right", end: "right left", scrub: true },
    });
  }
  setLines(q(".xp__today-label"), "note", { trigger: { trigger: atm, containerAnimation: passage, start: "right 70%" } });
  drawRule(q(".xp__tick")[0], { axis: "y", origin: "50% 0%", duration: 0.4, trigger: { trigger: atm, containerAnimation: passage, start: "right 70%" } });
  setLines(q(".xp__label"), "note", { trigger: { trigger: root, start: "top 60%" } });

  // Anything that takes focus inside the track is brought to the middle first.
  const onFocus = safe((event: FocusEvent) => {
    const leaf = (event.target as Element).closest<HTMLElement>(".leaf");
    if (leaf?.id) cutTo(leaf.id, { focus: false, mark: false });
  });
  track.addEventListener("focusin", onFocus);
  return () => {
    html.classList.remove("is-passage");
    track.removeEventListener("focusin", onFocus);
    ScrollTrigger.removeEventListener("refreshInit", measure);
  };
}
