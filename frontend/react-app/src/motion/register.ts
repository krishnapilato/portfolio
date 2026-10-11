import { gsap } from "./gsap";

/**
 * "In register at the reading line": a secondary layer is offset in
 * proportion to its distance from the middle of the viewport and lines up
 * exactly with its text when that text is being read. Screen speed is
 * about 1 + depth.
 */
export function registration(el: Element | null | undefined, depth: number) {
  if (!el) return null;
  return gsap.fromTo(
    el,
    { y: () => depth * window.innerHeight * 0.5 },
    {
      y: () => -depth * window.innerHeight * 0.5,
      ease: "none",
      scrollTrigger: { trigger: el, start: "center bottom", end: "center top", scrub: 0.5, invalidateOnRefresh: true },
    },
  );
}
