import { gsap } from "./gsap";

/**
 * Straight pencil rules are HTML elements drawn with scaleX or scaleY: a
 * composited transform costs an integrated GPU nothing, where a stroke
 * offset would repaint.
 */
export function drawRule(
  rule: Element | Element[] | null | undefined,
  options: { axis?: "x" | "y"; origin?: string; trigger?: ScrollTrigger.Vars; delay?: number; duration?: number; stagger?: number; to?: number } = {},
) {
  const targets = !rule ? [] : Array.isArray(rule) ? rule : [rule];
  if (!targets.length) return null;
  const prop = options.axis === "y" ? "scaleY" : "scaleX";
  return gsap.fromTo(
    targets,
    { [prop]: 0, visibility: "visible" },
    {
      [prop]: options.to ?? 1,
      transformOrigin: options.origin ?? (options.axis === "y" ? "50% 0%" : "0% 50%"),
      duration: options.duration ?? 0.6,
      ease: "pencil",
      stagger: options.stagger ?? 0,
      delay: options.delay ?? 0,
      scrollTrigger: options.trigger ? { toggleActions: "play none none reverse", ...options.trigger } : undefined,
    },
  );
}
