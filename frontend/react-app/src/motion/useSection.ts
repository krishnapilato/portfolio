import type { RefObject } from "react";
import { fontsReady } from "./fonts";
import { gsap, setupGsap, useGSAP } from "./gsap";
import { MEDIA, resolveMode, type Mode } from "./media";

/** Wraps a function so GSAP objects it creates later still belong to the section. */
export type Safe = <F extends (...args: never[]) => unknown>(f: F) => F;

export type Build = (api: { root: HTMLElement; mode: Mode; fine: boolean; safe: Safe }) => void | (() => void);

const settled: Promise<void>[] = [];

/** Resolves once every section built so far has finished its build. */
export const sectionsBuilt = () => Promise.all(settled).then(() => undefined);

/**
 * The only way a section animates. It waits for the fonts, resolves the
 * mode (wide, narrow, short, still) and builds inside a GSAP context that
 * matchMedia reverts and rebuilds when the mode changes, and that React
 * reverts on unmount. Everything a build creates, directly or through
 * `safe`, is cleaned up with it.
 */
export function useSection(scope: RefObject<HTMLElement | null>, build: Build) {
  useGSAP(
    () => {
      setupGsap();
      const mm = gsap.matchMedia();
      mm.add(
        MEDIA,
        (context, contextSafe) => {
          const conditions = (context.conditions ?? {}) as Record<string, boolean>;
          const mode = resolveMode(conditions);
          const safe = contextSafe as unknown as Safe;
          let alive = true;
          let cleanup: void | (() => void);
          const run = safe(() => {
            if (!alive || !scope.current) return;
            cleanup = build({ root: scope.current, mode, fine: conditions.fine, safe });
          });
          settled.push(fontsReady().then(() => run()));
          return () => {
            alive = false;
            cleanup?.();
          };
        },
        scope,
      );
      return () => mm.revert();
    },
    { scope },
  );
}
