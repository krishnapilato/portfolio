import { useEffect } from "react";
import { initialHash } from "./cut";
import { ScrollTrigger, setupGsap } from "./gsap";
import { MEDIA, motionWindow } from "./media";
import { sectionsBuilt } from "./useSection";

/**
 * Starts the book once every section has built: cancels the no-JS safety
 * timer, follows the reduced-motion preference live, refreshes every
 * trigger once the fonts are in, and honours a #page hash.
 */
export function useBootstrap() {
  useEffect(() => {
    setupGsap();
    const w = motionWindow();
    if (w.__motionTimer) window.clearTimeout(w.__motionTimer);
    const html = document.documentElement;

    const reduce = window.matchMedia(MEDIA.reduce);
    const onReduce = () => html.classList.toggle("motion", !reduce.matches && !w.__motionTimedOut);
    reduce.addEventListener("change", onReduce);

    let cancelled = false;
    sectionsBuilt().then(() =>
      requestAnimationFrame(() => {
        if (cancelled) return;
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
        initialHash();
        html.classList.add("is-built");
      }),
    );

    let timer = 0;
    const onFonts = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    document.fonts?.addEventListener("loadingdone", onFonts);

    return () => {
      cancelled = true;
      reduce.removeEventListener("change", onReduce);
      document.fonts?.removeEventListener("loadingdone", onFonts);
      window.clearTimeout(timer);
    };
  }, []);
}
