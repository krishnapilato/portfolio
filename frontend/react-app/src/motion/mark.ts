import { gsap } from "./gsap";

/**
 * The pencil mark: one underline per section, drawn from the left, after
 * its words have been set. With a trigger it draws on the way down and
 * lifts on the way back up.
 */
export function drawMark(mark: Element | null | undefined, options: { trigger?: ScrollTrigger.Vars; delay?: number; duration?: number } = {}) {
  const rule = mark?.querySelector(".mark__rule") ?? (mark?.classList.contains("mark__rule") ? mark : null);
  if (!rule) return null;
  return gsap.fromTo(
    rule,
    { scaleX: 0, visibility: "visible" },
    {
      scaleX: 1,
      transformOrigin: "0% 50%",
      duration: options.duration ?? 0.7,
      ease: "pencil",
      delay: options.delay ?? 0,
      scrollTrigger: options.trigger ? { toggleActions: "play none none reverse", ...options.trigger } : undefined,
    },
  );
}

/** A short pencil underline under a heading the reader has just jumped to. */
export function arrivalMark(heading: Element) {
  const rule = document.createElement("span");
  rule.className = "arrival";
  rule.setAttribute("aria-hidden", "true");
  (heading as HTMLElement).style.position ||= "relative";
  heading.appendChild(rule);
  gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.6, ease: "pencil" });
  gsap.to(rule, { opacity: 0, delay: 1.6, duration: 0.4, onComplete: () => rule.remove() });
}
