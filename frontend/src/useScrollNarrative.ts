import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createLight } from "./light";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function useScrollNarrative() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", standard: "(prefers-reduced-motion: no-preference)" }, (context) => {
      const root = scope.current;
      if (!root) return;
      const reduced = Boolean(context.conditions?.reduced);
      // Reduced motion keeps the fades and drops travel and blur.
      const blur = (px: number) => reduced ? "blur(0px)" : `blur(${px}px)`;
      const rise = (px: number) => reduced ? 0 : px;
      const headings = [...root.querySelectorAll<HTMLElement>("[data-intro-title], [data-reveal], [data-reading]")];
      const splits = headings.map((element) => SplitText.create(element, { type: "words", wordsClass: "ink-word", aria: "auto" }));

      gsap.timeline()
        .from(splits[0].words, { opacity: 0, filter: blur(12), y: rise(24), duration: reduced ? 0.6 : 1.6, stagger: 0.12, ease: "power3.out" })
        .from(".opening [data-fade]", { opacity: 0, duration: 1.2, stagger: 0.15, ease: "power1.out" }, "-=0.8");

      splits.slice(1).forEach((split, index) => {
        const element = headings[index + 1];
        if (element.hasAttribute("data-reading")) {
          // A pause is read at scrolling pace: each word surfaces as the reader reaches it.
          gsap.from(split.words, { opacity: 0.08, filter: blur(5), stagger: 0.06, ease: "none",
            scrollTrigger: { trigger: element, start: "top 40%", end: "top -5%", scrub: true } });
          return;
        }
        gsap.from(split.words, { opacity: 0, filter: blur(10), y: rise(18), duration: reduced ? 0.6 : 1.3, stagger: 0.07, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 85%", toggleActions: "play none none reverse" } });
      });

      root.querySelectorAll<HTMLElement>(".chapter [data-fade]").forEach((element) => {
        gsap.from(element, { opacity: 0, y: rise(12), duration: 1.1, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 90%", toggleActions: "play none none reverse" } });
      });
      gsap.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, ease: "none", transformOrigin: "left",
        scrollTrigger: { start: 0, end: "max", scrub: true } });

      const stopLight = createLight(root, headings, !reduced);
      return () => { stopLight(); splits.forEach((split) => split.revert()); };
    }, scope);
    return () => media.revert();
  }, []);

  return scope;
}
