/**
 * The four ways the book can move, as media conditions. Every section
 * builds from the same conditions, so the page is always in one mode.
 *  - wide: a desk-sized screen, scrubbed scenes and the sideways passage
 *  - narrow: a phone held upright, the same scenes in a column
 *  - short: a phone on its side, no sticky stages at all
 *  - still: reduced motion, every final state, nothing moves
 */
export const MEDIA = {
  wide: "(min-width: 760px) and (min-height: 540px) and (prefers-reduced-motion: no-preference)",
  narrow: "((max-width: 759.98px) or (max-height: 539.98px)) and (prefers-reduced-motion: no-preference)",
  short: "(max-height: 539.98px)",
  reduce: "(prefers-reduced-motion: reduce)",
  fine: "(hover: hover) and (pointer: fine)",
};

export type Mode = "wide" | "narrow" | "short" | "still";

type MotionWindow = Window & { __motionTimedOut?: boolean; __motionTimer?: number };

export const motionWindow = () => window as MotionWindow;

export function resolveMode(conditions: Record<string, boolean>): Mode {
  if (conditions.reduce || motionWindow().__motionTimedOut) return "still";
  if (conditions.wide) return "wide";
  if (conditions.short) return "short";
  return "narrow";
}
