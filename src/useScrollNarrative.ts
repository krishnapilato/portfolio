import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createLight } from "./light";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function useScrollNarrative() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const root = scope.current;
      if (!root) return;
      const headings = [...root.querySelectorAll<HTMLElement>("[data-intro-title], [data-reveal], [data-reading]")];
      const splits = headings.map((element) => SplitText.create(element, { type: "words", wordsClass: "ink-word", aria: "auto" }));

      const scenes = Array.from(root.querySelectorAll<HTMLElement>(".scene"));
      gsap.set(scenes.slice(1), { autoAlpha: 0 });
      const timeline = gsap.timeline({
        defaults: { ease: "sine.inOut" },
        scrollTrigger: { start: 0, end: "max", scrub: true },
      });

      let position = 0;
      scenes.slice(1).forEach((scene, index) => {
        const silence = 0.035;
        timeline.to(scenes[index], { autoAlpha: 0, duration: 0.20 }, position);
        position += 0.20 + silence;
        timeline.to(scene, { autoAlpha: 1, duration: 0.20 }, position);
        position += 0.20 + 0.18;
      });
      timeline.to({}, { duration: 0.18 }, position - 0.18);
      root.style.height = (100 + position * 100) + "svh";
      ScrollTrigger.refresh();
      const stopLight = createLight(root, headings);
      return () => { root.style.removeProperty("height"); stopLight(); splits.forEach((split) => split.revert()); };
    }, scope);
    return () => context.revert();
  }, []);

  return scope;
}


