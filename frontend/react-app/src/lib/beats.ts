/**
 * A beat is one scene of the film. Its `weight` is its share of the scroll
 * length in viewport heights; ranges are derived from the weights so the
 * DOM spacer sections and the camera timeline can never disagree.
 */
export type BeatRange = { id: string; start: number; end: number; weight: number };

export type BeatTiming = {
  weight: number;
  /** Fraction of the beat's range spent parked on its pose. */
  hold?: number;
  /**
   * Share of the incoming camera segment travelled during THIS beat's
   * arrival (the rest is travelled during the previous beat's departure).
   * 0.5 splits the move evenly; 1 keeps the previous beat parked until its
   * range ends and moves entirely inside this beat.
   */
  arriveShare?: number;
  /** Fraction of the beat's range spent arriving; defaults to half the move time. */
  arriveFrac?: number;
};

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

export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** Cubic ease-in-out, for moves that should feel like a dolly with mass. */
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The three phases of a beat, as fractions of its range. */
export type Phases = { arrive: number; hold: number; leave: number };

export function phasesOf(beat: BeatTiming): Phases {
  const hold = beat.hold ?? 0.55;
  const move = Math.max(0, 1 - hold);
  const arrive = beat.arriveFrac ?? move / 2;
  return { arrive: Math.min(arrive, move), hold, leave: Math.max(0, move - Math.min(arrive, move)) };
}

/**
 * Continuous "camera time" for the whole film: `i` exactly while beat i is
 * parked, and easing through the segments between poses during the move
 * phases. Each segment is split between the departing beat and the
 * arriving beat by the arriving beat's `arriveShare`, so a beat can own
 * the whole move into it (an orbit, a landing) when the story needs it.
 * The curve is symmetric per phase, so scrolling up plays it backwards.
 */
export function cameraTime(beats: BeatTiming[], beat: number, local: number): number {
  const p = phasesOf(beats[beat]);
  const last = beats.length - 1;
  // A beat with no departure phase hands its whole move to the next beat's
  // arrival (and a beat with no arrival takes it from the previous
  // departure), so camera time is continuous across every boundary.
  const prev = beat > 0 ? phasesOf(beats[beat - 1]) : null;
  const next = beat < last ? phasesOf(beats[beat + 1]) : null;
  const arriveShare = !prev ? 0 : prev.leave > 0 ? (beats[beat].arriveShare ?? 0.5) : 1;
  const leaveShare = !next ? 0 : next.arrive > 0 ? 1 - (beats[beat + 1].arriveShare ?? 0.5) : 1;
  if (local < p.arrive && p.arrive > 0) {
    return beat - arriveShare + arriveShare * easeInOutCubic(local / p.arrive);
  }
  const leaveStart = 1 - p.leave;
  if (local > leaveStart && p.leave > 0) {
    return beat + leaveShare * easeInOutCubic((local - leaveStart) / p.leave);
  }
  return beat;
}

/**
 * Text visibility for a beat: in over the last 40% of the arrival, fully
 * readable through the hold, out over the first 30% of the departure, so
 * no two blocks are ever visible at once and words never move with the camera.
 */
export function textAlpha(beats: BeatTiming[], beat: number, local: number): number {
  const p = phasesOf(beats[beat]);
  const last = beats.length - 1;
  let a = 1;
  if (beat > 0 && p.arrive > 0) {
    const inStart = p.arrive * 0.6;
    if (local < inStart) a = 0;
    else if (local < p.arrive) a = (local - inStart) / (p.arrive - inStart);
  }
  if (beat < last && p.leave > 0) {
    const outStart = 1 - p.leave;
    const outEnd = outStart + p.leave * 0.3;
    if (local > outEnd) a = 0;
    else if (local > outStart) a = Math.min(a, 1 - (local - outStart) / (outEnd - outStart));
  }
  return smooth(a);
}

/**
 * Vertical field of view (degrees) that shows the same horizontal extent
 * as a lens of `mm` on a 36 mm-wide frame, for a viewport of `aspect`.
 * At a 3:2 aspect this is the classic 35mm-equivalent vertical fov.
 */
export const fovFromLens = (mm: number, aspect = 1.5) =>
  2 * Math.atan(18 / mm / aspect) * (180 / Math.PI);
