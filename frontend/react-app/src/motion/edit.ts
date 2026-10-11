import { gsap } from "./gsap";

/** Layout position of an element (ignores transforms, so parallax never skews it). */
function layoutOffset(el: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

const fontSize = (el: Element) => parseFloat(getComputedStyle(el).fontSize) || 16;

const delta = (from: HTMLElement, to: HTMLElement) => {
  const a = layoutOffset(from);
  const b = layoutOffset(to);
  return { x: b.x - a.x, y: b.y - a.y };
};

export type EditOptions = {
  /** Scroll range of the edit; scrubbed, so scrolling back up undoes it. */
  scrollTrigger: ScrollTrigger.Vars;
  /** "Draft" → "Fair copy" label, swapped halfway. */
  label?: Element | null;
  /** The short footnote rule drawn as the notes fill. */
  notesRule?: Element | null;
  /** Where the edit's notes live (a leaf, or the section). */
  scope: Element;
  /**
   * Close up: the copy-editor's mark for "remove this space". The fair copy
   * is shorter than its draft; these elements move by the difference (1 =
   * down onto the fair copy from above, -1 = up into the gap from below),
   * so the page closes around the plain sentence. Transforms only.
   */
  closeUp?: { targets: Element[]; direction: 1 | -1 };
};

/**
 * The edit: a crowded draft becomes its fair copy under the reader's hand.
 * Each jargon group is picked up (it dims), carried down into its numbered
 * note, scaled to the note face, and set there; then the plain words close
 * the gaps it left and settle where the fair copy sets them. Complexity is
 * moved, not deleted, and scrolling back up brings it back into the
 * sentence.
 *
 * Every distance is a function measured from layout at refresh time, so
 * resizes, font swaps and the sideways passage never break the pairing.
 * Words are paired by index; `validate.ts` guarantees the counts match at
 * build time, and a runtime mismatch falls back to a plain cross-fade.
 */
export function buildEdit(root: HTMLElement, options: EditOptions) {
  const id = root.dataset.edit;
  const draft = root.querySelector<HTMLElement>(".edit__draft");
  const fair = root.querySelector<HTMLElement>(".edit__fair");
  if (!id || !draft || !fair) return null;

  const plainOld = Array.from(draft.querySelectorAll<HTMLElement>(".w:not(.j)"));
  const plainNew = Array.from(fair.querySelectorAll<HTMLElement>(".fw"));
  const groups = Array.from(draft.querySelectorAll<HTMLElement>(".jargon"));
  const notes = Array.from(options.scope.querySelectorAll<HTMLElement>(`[data-edit-note="${id}"]`));
  const jargonOld = groups.map((g) => Array.from(g.querySelectorAll<HTMLElement>(".w")));
  const jargonNew = groups.map((g) => {
    const note = notes.find((n) => n.getAttribute("value") === g.dataset.note);
    return note ? Array.from(note.querySelectorAll<HTMLElement>(".nw")) : [];
  });
  const noteNumbers = notes.map((n) => n.querySelector(".note__n")).filter(Boolean) as Element[];
  const refs = Array.from(fair.querySelectorAll(".ref"));
  const masks = Array.from(draft.querySelectorAll<HTMLElement>(".wm"));
  const allNew = [...plainNew, ...jargonNew.flat()];

  const closeUp = options.closeUp?.targets.filter(Boolean) ?? [];
  const direction = options.closeUp?.direction ?? -1;
  const gap = () => Math.max(0, draft.offsetHeight - fair.offsetHeight);
  const ridesCloseUp = (el: Element) => closeUp.some((t) => t.contains(el));
  const movesWith = (el: Element) => (ridesCloseUp(el) ? direction * gap() : 0);

  const paired =
    plainOld.length === plainNew.length && jargonOld.every((g, i) => g.length === jargonNew[i].length && g.length > 0);

  // Start state: the draft is the text you see; the fair copy and the notes
  // are laid out where they will be, but not yet set.
  gsap.set([fair, ...notes], { visibility: "visible" });
  gsap.set([...allNew, ...noteNumbers], { opacity: 0 });

  let editing = false;
  const setEditing = (on: boolean) => {
    if (on === editing) return;
    editing = on;
    root.classList.toggle("is-editing", on);
    // Words leave their masks only while they travel.
    gsap.set(masks, { overflow: on ? "visible" : "clip" });
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      ...options.scrollTrigger,
      scrub: options.scrollTrigger.scrub ?? 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => setEditing(self.progress > 0.001 && self.progress < 0.999),
      onLeave: () => setEditing(false),
      onLeaveBack: () => setEditing(false),
    },
  });

  if (!paired) {
    tl.to(draft, { opacity: 0, duration: 0.5 }, 0).to([...allNew, ...noteNumbers], { opacity: 1, duration: 0.5 }, 0.5);
    return tl;
  }

  // Two beats, so the edit can be read while it happens. First the
  // complexity is lifted out: the editor picks the jargon up (it takes the
  // pencil's colour and goes faint) and carries it down into its notes,
  // leaving gaps in the sentence. Then the sentence closes up.
  const LIFT = 0.06;
  const CLOSE = 0.48;
  const BEAT = 0.36;

  tl.to(jargonOld.flat(), { color: "#2a4a9a", opacity: 0.42, duration: 0.14, ease: "power1.out" }, 0);
  // Note numbers open their places as the words arrive.
  tl.to(noteNumbers, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0.3);
  if (options.notesRule) {
    tl.fromTo(options.notesRule, { scaleX: 0, visibility: "visible" }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.25, ease: "pencil" }, 0.26);
  }

  // Beat one: the jargon streams out in reading order, each word into its
  // note, taking the note face as it lands.
  const count = jargonOld.flat().length;
  const TRAVEL = 0.24;
  let k = 0;
  jargonOld.forEach((group, gi) => {
    group.forEach((word, wi) => {
      const target = jargonNew[gi][wi];
      // The note face is smaller: scale by the font-size ratio, and centre
      // the scaled box on the note word's box so the two lines of text meet.
      const scale = () => fontSize(target) / Math.max(1, fontSize(word));
      const landY = () => delta(word, target).y + (target.offsetHeight - word.offsetHeight * scale()) / 2;
      const at = LIFT + (count > 1 ? ((CLOSE - LIFT - TRAVEL) * k++) / (count - 1) : 0);
      tl.to(word, { x: () => delta(word, target).x, y: landY, scale, transformOrigin: "0 0", duration: TRAVEL, ease: "power2.inOut" }, at);
      // If its note closes up with the page, it rides along in beat two.
      if (ridesCloseUp(target)) tl.to(word, { y: () => landY() + movesWith(target), duration: BEAT, ease: "power2.inOut" }, CLOSE);
    });
  });

  if (options.label) {
    const [from, to] = Array.from(options.label.children);
    tl.fromTo(from, { yPercent: 0 }, { yPercent: -105, duration: 0.12, ease: "settle" }, CLOSE).fromTo(
      to,
      { yPercent: 105, visibility: "visible" },
      { yPercent: 0, duration: 0.12, ease: "settle" },
      CLOSE,
    );
  }

  // Beat two: the plain words close the gaps together, line by line as a
  // block of type would, and the page closes up around the shorter sentence.
  tl.to(
    plainOld,
    {
      x: (i) => delta(plainOld[i], plainNew[i]).x,
      y: (i) => delta(plainOld[i], plainNew[i]).y,
      duration: BEAT,
      ease: "power2.inOut",
    },
    CLOSE,
  );
  if (closeUp.length) tl.to(closeUp, { y: () => direction * gap(), duration: BEAT, ease: "power2.inOut" }, CLOSE);

  // The fair copy takes over where the draft has landed.
  tl.to([...plainOld, ...jargonOld.flat()], { opacity: 0, duration: 0.1 }, 0.86).to(allNew, { opacity: 1, duration: 0.1 }, 0.86);
  if (refs.length) tl.fromTo(refs, { yPercent: 60 }, { yPercent: 0, duration: 0.1, ease: "settle" }, 0.9);
  return tl;
}

/** Still mode: the fair copy and its notes as printed, no draft. */
export function settleEdit(root: HTMLElement, scope: Element) {
  const id = root.dataset.edit;
  root.classList.add("is-fair");
  gsap.set([root.querySelector(".edit__fair"), ...Array.from(scope.querySelectorAll(`[data-edit-note="${id}"]`))], {
    visibility: "visible",
  });
}
