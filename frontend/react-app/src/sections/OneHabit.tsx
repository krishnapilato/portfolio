import { useRef } from "react";
import { ONE_HABIT } from "../content/copy";
import { gsap, ScrollTrigger, SplitText } from "../motion/gsap";
import { useSection } from "../motion/useSection";
import Folio from "../ui/Folio";
import Notes from "../ui/Notes";
import { Mark, Ref } from "../ui/text";

/** Layout position relative to an ancestor, ignoring transforms. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * Folio 2. Two columns, set at two speeds, come into register: the divider
 * between them retracts, the two halves become one sentence, and the line
 * that divided reappears as the pencil under "feel simple". Scrubbed, so
 * scrolling back up takes the sentence apart again.
 */
export default function OneHabit() {
  const ref = useRef<HTMLElement>(null);

  useSection(ref, ({ root, mode }) => {
    if (mode === "still") return;
    const q = gsap.utils.selector(root);
    const stage = q(".habit__inner")[0] as HTMLElement;
    const dw = q(".dw") as HTMLElement[];
    const hw = q(".hw") as HTMLElement[];
    const dn = q(".habit__dnote") as HTMLElement[];
    const fn = q(".habit__notes .note") as HTMLElement[];
    const stacked = window.matchMedia("(max-width: 767.98px)").matches;
    const move = (from: HTMLElement[], to: HTMLElement[], axis: "x" | "y") => (i: number) =>
      offsetWithin(to[i], stage)[axis] - offsetWithin(from[i], stage)[axis];

    const rest = SplitText.create(q(".habit__rest, .habit__fair .mark__text, .habit__end"), {
      type: "words",
      mask: "words",
      aria: "none",
    });
    gsap.set([...hw, q(".habit__notes")[0]], { autoAlpha: 0 });
    gsap.set([...q(".habit__fair, .habit__draft"), ...fn], { visibility: "visible" });
    gsap.set(rest.words, { yPercent: 105 });

    const tl = gsap.timeline({ defaults: { ease: "none" }, paused: mode === "short" });
    tl.to(q(".habit__divider"), { [stacked ? "scaleX" : "scaleY"]: 0, transformOrigin: "50% 50%", duration: 0.25, ease: "power1.inOut" }, 0)
      .to(dw, { x: move(dw, hw, "x"), y: move(dw, hw, "y"), duration: 0.3, ease: "power2.inOut" }, 0.2)
      .to(dn, { x: move(dn, fn, "x"), y: move(dn, fn, "y"), duration: 0.3, ease: "power2.inOut" }, 0.2)
      .set(q(".habit__draft"), { autoAlpha: 0 }, 0.5)
      .set([...hw, q(".habit__notes")[0]], { autoAlpha: 1 }, 0.5)
      .to(rest.words, { yPercent: 0, duration: 0.2, ease: "settle", stagger: 0.012 }, 0.5)
      .fromTo(q(".habit__fair .mark__rule"), { scaleX: 0, visibility: "visible" }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.2, ease: "pencil" }, 0.8);

    if (mode === "short") {
      // A phone on its side has no room for a sticky stage: the same
      // sequence plays when the page reaches the middle, and undoes when
      // you scroll back above it.
      tl.duration(2.4);
      ScrollTrigger.create({
        trigger: root,
        start: "center 60%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
        invalidateOnRefresh: true,
        onRefresh: () => tl.invalidate(),
      });
      return;
    }

    ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      animation: tl,
      invalidateOnRefresh: true,
    });

    // The approach: column A travels at 1.25x, column B at 0.8x, and they
    // arrive on one baseline exactly as the stage settles.
    const k = mode === "wide" ? 1 : 0.5;
    const approach = { trigger: root, start: "top bottom", end: "top top", scrub: 0.8, invalidateOnRefresh: true };
    gsap.fromTo(q(".habit__col--a"), { y: () => 0.25 * k * window.innerHeight }, { y: 0, ease: "none", scrollTrigger: approach });
    gsap.fromTo(q(".habit__col--b"), { y: () => -0.2 * k * window.innerHeight }, { y: 0, ease: "none", scrollTrigger: { ...approach } });
  });

  const [noteA, noteB] = ONE_HABIT.notes;
  return (
    <section id="one-habit" className="page habit" aria-labelledby="one-habit-h" ref={ref}>
      <h2 id="one-habit-h" className="sr-only">
        {ONE_HABIT.heading}
      </h2>
      <div className="habit__stage">
        <div className="wrap habit__inner">
          <div className="habit__draft" aria-hidden="true" data-nosnippet="">
            <div className="habit__col habit__col--a">
              <p className="habit__line">
                <span className="dw">Two</span>{" "}
                <span className="dw">
                  countries,<Ref n={1} />
                </span>
              </p>
              <p className="habit__dnote note-text">
                <span className="note__n">1</span> {noteA.text as string}
              </p>
            </div>
            <span className="habit__divider" />
            <div className="habit__col habit__col--b">
              <p className="habit__line">
                <span className="dw">two</span>{" "}
                <span className="dw">
                  languages,<Ref n={2} />
                </span>
              </p>
              <p className="habit__dnote note-text">
                <span className="note__n">2</span> {noteB.text as string}
              </p>
            </div>
          </div>
          <div className="habit__fair">
            <p className="habit__sentence">
              <span className="hw">Two</span>{" "}
              <span className="hw">
                countries,
                <Ref n={1} />
              </span>{" "}
              <span className="hw">two</span>{" "}
              <span className="hw">
                languages,
                <Ref n={2} />
              </span>{" "}
              <span className="habit__rest">{ONE_HABIT.rest}</span>
              <Mark>{ONE_HABIT.mark}</Mark>
              <span className="habit__end">{ONE_HABIT.end}</span>
            </p>
            <Notes className="habit__notes" notes={ONE_HABIT.notes.map((note) => ({ note }))} />
          </div>
          <Folio n={2} className="habit__folio" />
        </div>
      </div>
    </section>
  );
}
