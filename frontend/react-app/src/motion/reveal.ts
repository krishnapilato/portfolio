import { gsap, SplitText } from "./gsap";

/**
 * "Set, don't throw": text rises onto its baseline from behind a mask, the
 * way a compositor sets a line, and never arrives from anywhere else.
 * Three tempos: display lines, body lines, notes and labels.
 */
export type Tier = "display" | "body" | "note";

const TEMPO: Record<Tier, { duration: number; stagger: number }> = {
  display: { duration: 1.15, stagger: 0.11 },
  body: { duration: 0.9, stagger: 0.07 },
  note: { duration: 0.6, stagger: 0.04 },
};

type Target = Element | Element[] | NodeListOf<Element> | null | undefined;

const list = (target: Target): Element[] =>
  !target ? [] : target instanceof Element ? [target] : Array.from(target as ArrayLike<Element>).filter(Boolean);

export type SetOptions = {
  /** Scroll position that sets the lines; leaving back above it un-sets them. */
  trigger?: ScrollTrigger.Vars;
  delay?: number;
};

/**
 * Splits into lines behind masks and sets them. With a trigger, scrolling
 * down sets the lines and scrolling back up past the trigger un-sets them,
 * so the page reads the same in both directions. Without one, it plays
 * from load. `aria: "none"` leaves the text exactly as written for screen
 * readers (an aria-label on a paragraph is not reliably read), and lines
 * never break a word. autoSplit re-splits after a resize or a font swap,
 * keeping the reveal's progress.
 */
export function setLines(target: Target, tier: Tier, options: SetOptions = {}) {
  const elements = list(target);
  if (!elements.length) return null;
  const { duration, stagger } = TEMPO[tier];
  return SplitText.create(elements, {
    type: "lines",
    mask: "lines",
    linesClass: "ln",
    aria: "none",
    autoSplit: true,
    ignore: ".mark__rule",
    onSplit(self) {
      return gsap.fromTo(
        self.lines,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration,
          ease: "settle",
          stagger,
          delay: options.delay ?? 0,
          onStart: () => gsap.set(elements, { visibility: "visible" }),
          scrollTrigger: options.trigger
            ? { toggleActions: "play none none reverse", ...options.trigger }
            : undefined,
          immediateRender: true,
        },
      );
    },
  });
}

/** Makes elements visible at once, for still mode and for text that is never set. */
export function show(target: Target) {
  const elements = list(target);
  if (elements.length) gsap.set(elements, { visibility: "visible" });
}

/**
 * Sets a draft paragraph word by word, grouped into its visual lines so it
 * reads as lines being set. The words are already in masks in the markup
 * (see Edit.tsx), because the edit later moves the same words.
 */
export function setDraft(draft: Element | null, options: SetOptions = {}) {
  if (!draft) return null;
  const words = Array.from(draft.querySelectorAll<HTMLElement>(".w"));
  const tops = words.map((w) => (w.parentElement as HTMLElement).offsetTop);
  const lineOf = new Map<number, number>();
  let line = -1;
  let last = -Infinity;
  tops.forEach((top, i) => {
    if (top > last + 2) {
      line += 1;
      last = top;
    }
    lineOf.set(i, line);
  });
  const { duration, stagger } = TEMPO.body;
  gsap.set(draft, { visibility: "visible" });
  return gsap.fromTo(
    words,
    { yPercent: 105 },
    {
      yPercent: 0,
      duration,
      ease: "settle",
      delay: options.delay ?? 0,
      stagger: (i) => (lineOf.get(i) ?? 0) * stagger,
      scrollTrigger: options.trigger ? { toggleActions: "play none none reverse", ...options.trigger } : undefined,
    },
  );
}

/**
 * Notes are set after what they annotate: the text in lines like any
 * other, the pencil number fading in beside it. (A note is a two-column
 * grid, so only its text column is split.)
 */
export function setNotes(items: Element[] | NodeListOf<Element>, options: SetOptions = {}) {
  const list = Array.from(items);
  if (!list.length) return null;
  const texts = list.map((li) => li.querySelector(".note__text")).filter(Boolean) as Element[];
  const numbers = list.map((li) => li.querySelector(".note__n")).filter(Boolean) as Element[];
  const split = setLines(texts, "note", options);
  gsap.fromTo(
    numbers,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.4,
      delay: (options.delay ?? 0) + 0.1,
      stagger: TEMPO.note.stagger,
      scrollTrigger: options.trigger ? { toggleActions: "play none none reverse", ...options.trigger } : undefined,
    },
  );
  gsap.set(list, { visibility: "visible" });
  return split;
}

/** Folios and other single tokens: a quiet fade, no split. */
export function setToken(target: Target, options: SetOptions = {}) {
  const elements = list(target);
  if (!elements.length) return null;
  return gsap.fromTo(
    elements,
    { opacity: 0, visibility: "visible" },
    {
      opacity: 1,
      duration: 0.6,
      ease: "power1.out",
      delay: options.delay ?? 0,
      scrollTrigger: options.trigger ? { toggleActions: "play none none reverse", ...options.trigger } : undefined,
    },
  );
}
