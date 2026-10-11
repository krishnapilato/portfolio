import { gsap } from "./gsap";

/**
 * Masked label swap: two labels stacked in one clipped cell; the old one
 * leaves upward as the new one rises into place. GSAP never writes text.
 * Returns a tween from the first label to the second (paused, so a
 * timeline can scrub it or a click can play it).
 */
export function swapLabel(box: Element | null | undefined) {
  if (!box) return null;
  const [from, to] = Array.from(box.children);
  if (!from || !to) return null;
  const tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: "settle" } });
  tl.fromTo(from, { yPercent: 0 }, { yPercent: -105 }, 0).fromTo(to, { yPercent: 105, visibility: "visible" }, { yPercent: 0 }, 0);
  return tl;
}
