import { gsap, ScrollTrigger } from "./gsap";

const PARTS = "[data-reveal], .edit, .notes, .folio, .crop, .fig, .plate__numeral";
/** Scene roots: a scene inside another (a plate inside Work) owns its own parts. */
const SCENES = ".page, .plate";

/**
 * Reduced motion: nothing travels, nothing scrubs, the page is the fair
 * copy. What is new still arrives, quietly: each part further down the
 * page fades in once, the first time it comes on screen. Opacity only.
 * Parts already on screen when the page starts are left exactly as they
 * are, so nothing the reader can see ever disappears.
 */
export function calmReveal(root: HTMLElement) {
  const all = Array.from(root.querySelectorAll<HTMLElement>(PARTS)).filter((el) => el.closest(SCENES) === root);
  const below = all.filter(
    (el) => !all.some((other) => other !== el && other.contains(el)) && el.getBoundingClientRect().top > window.innerHeight,
  );
  if (!below.length) return;
  gsap.set(below, { opacity: 0 });
  ScrollTrigger.batch(below, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, duration: 0.7, ease: "power1.out", stagger: 0.08, overwrite: true }),
  });
}
