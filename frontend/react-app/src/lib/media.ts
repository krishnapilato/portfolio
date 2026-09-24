import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

const subscribers = new Map<string, (onChange: () => void) => () => void>();

/** A live media query as React state, without an effect or a re-render loop. */
export function useMediaQuery(query: string): boolean {
  let sub = subscribers.get(query);
  if (!sub) {
    sub = subscribe(query);
    subscribers.set(query, sub);
  }
  return useSyncExternalStore(
    sub,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const COARSE_POINTER = "(hover: none) and (pointer: coarse)";

export function useReducedMotion() {
  return useMediaQuery(REDUCED_MOTION);
}
