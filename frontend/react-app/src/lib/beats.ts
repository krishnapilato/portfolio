/**
 * A beat is one scene of the film. Its `weight` is its share of the scroll
 * length in viewport heights; ranges are derived from the weights so the
 * DOM spacer sections and the camera timeline can never disagree.
 */
export type BeatRange = { id: string; start: number; end: number; weight: number };

export function computeRanges<T extends { id: string; weight: number }>(beats: T[]): BeatRange[] {
  const total = beats.reduce((sum, b) => sum + b.weight, 0);
  // The document is `total` viewports tall, so the scrollable distance is
  // (total - 1) viewports; the last beat is fully in view at progress 1.
  const scrollable = Math.max(total - 1, 1e-6);
  let cursor = 0;
  return beats.map((b) => {
    const start = Math.min(cursor / scrollable, 1);
    cursor += b.weight;
    const end = Math.min(cursor / scrollable, 1);
    return { id: b.id, start, end, weight: b.weight };
  });
}

/** Index of the beat that contains `progress` (the last one at 1). */
export function beatAt(ranges: BeatRange[], progress: number): number {
  for (let i = 0; i < ranges.length; i++) {
    if (progress < ranges[i].end) return i;
  }
  return ranges.length - 1;
}

/** 0..1 within a beat's range. */
export function localT(range: BeatRange, progress: number): number {
  const span = range.end - range.start;
  if (span <= 0) return 1;
  return clamp01((progress - range.start) / span);
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Eases a 0..1 value so it moves during the first and last parts of the
 * range and parks in the middle: the camera arrives, holds while the text
 * is read, then leaves. `hold` is the fraction of the range that is parked.
 * The curve is symmetric, so scrolling back plays the same move in reverse.
 */
export function holdEase(t: number, hold = 0.5): number {
  const travel = (1 - hold) / 2;
  if (travel <= 0) return t < 0.5 ? 0 : 1;
  if (t < travel) return 0.5 * smooth(t / travel);
  if (t > 1 - travel) return 0.5 + 0.5 * smooth((t - (1 - travel)) / travel);
  return 0.5;
}

export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** Cubic ease-in-out, for moves that should feel like a dolly with mass. */
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Vertical field of view (degrees) that shows the same horizontal extent
 * as a lens of `mm` on a 36 mm-wide frame, for a viewport of `aspect`.
 * At a 3:2 aspect this is the classic 35mm-equivalent vertical fov.
 */
export const fovFromLens = (mm: number, aspect = 1.5) =>
  2 * Math.atan(18 / mm / aspect) * (180 / Math.PI);
