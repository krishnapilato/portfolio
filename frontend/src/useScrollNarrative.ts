import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function useScrollNarrative() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", standard: "(prefers-reduced-motion: no-preference)" }, (context) => {
      const root = scope.current;
      if (!root) return;
      const reduced = Boolean(context.conditions?.reduced);
      const splits: SplitText[] = [];
      const intro = SplitText.create(root.querySelector("[data-intro-title]"), { type: "words", aria: "auto" });
      splits.push(intro);
      gsap.from(intro.words, { yPercent: reduced ? 0 : 65, opacity: 0, duration: reduced ? 0.4 : 1, stagger: 0.08, ease: "power3.out" });
      gsap.to("[data-intro-copy]", { y: reduced ? 0 : -55, opacity: 0,
        scrollTrigger: { trigger: ".intro", start: "top top", end: "bottom 20%", scrub: true } });
      gsap.to("[data-orbit]", { rotation: reduced ? 0 : 55, transformOrigin: "50% 50%", ease: "none",
        scrollTrigger: { trigger: ".intro", start: "top top", end: "bottom top", scrub: true } });

      root.querySelectorAll<HTMLElement>("[data-reveal], [data-reading]").forEach((element) => {
        const reading = element.hasAttribute("data-reading");
        const split = SplitText.create(element, { type: "words", aria: "auto" });
        splits.push(split);
        // The final invitation stays visible: there is no following scene to transition into.
        if (element.closest("#contact")) {
          gsap.from(split.words, { opacity: 0, yPercent: reduced ? 0 : 35, stagger: 0.025, ease: "none",
            scrollTrigger: { trigger: element, start: "clamp(top 92%)", end: "clamp(center 55%)", scrub: true } });
          return;
        }
        gsap.timeline({ scrollTrigger: { trigger: element, start: "clamp(top 92%)", end: "clamp(bottom -12%)", scrub: true } })
          .from(split.words, { opacity: reading ? 0.15 : 0, yPercent: reading || reduced ? 0 : 35, stagger: 0.025, duration: 0.2, ease: "none" })
          .to({}, { duration: 0.55 })
          .to(split.words, { opacity: 0, yPercent: reduced ? 0 : -25, stagger: 0.01, duration: 0.18, ease: "none" });
      });
      gsap.from("[data-measure]", { scaleX: 0, transformOrigin: "left", ease: "none",
        scrollTrigger: { trigger: ".impact-measure", start: "top 85%", end: "center 45%", scrub: true } });
      gsap.to("[data-scan]", { top: reduced ? "50%" : "95%", ease: "none",
        scrollTrigger: { trigger: ".scanner-visual", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, ease: "none", transformOrigin: "left",
        scrollTrigger: { start: 0, end: "max", scrub: true } });
      return () => splits.forEach((split) => split.revert());
    }, scope);
    return () => media.revert();
  }, []);

  return scope;
}
