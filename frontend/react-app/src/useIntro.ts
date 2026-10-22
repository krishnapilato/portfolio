import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export function useIntro() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-line]", { yPercent: 105, duration: 1.1, stagger: 0.12 })
        .from("[data-intro]", { autoAlpha: 0, y: 8, duration: 0.8, stagger: 0.08 }, "-=0.7")
        .from("[data-decor]", { autoAlpha: 0, duration: 1.2, stagger: 0.05 }, "<");
    }, scope);
    return () => context.revert();
  }, []);

  return scope;
}
