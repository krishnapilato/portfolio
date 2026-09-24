import type { BeatTiming } from "../lib/beats";

export type V3 = [number, number, number];

/** One parked camera pose per beat; the rig travels between them. */
export type Keyframe = BeatTiming & {
  id: string;
  position: V3;
  target: V3;
  /** Points the path passes through on the way to this pose. */
  via?: V3[];
  /** 35mm-equivalent focal length: the HORIZONTAL framing on a 36 mm frame. */
  lensMm: number;
  /** "case": the pose is in the aircraft's own frame and rides with it. */
  frame?: "world" | "case";
  /** Degrees of orbit around the target across the beat (continuous, not parked). */
  drift?: number;
  /** Extra vertical view offset for this beat, as a fraction of the height. */
  viewOffsetY?: { landscape: number; portrait: number };
  /** Overrides for viewports taller than wide. */
  portrait?: { position?: V3; target?: V3; lensMm?: number };
  /** The object reaches into the text column in this pose: scrim the words. */
  scrim?: boolean;
};


const ORBIT_CENTRE: [number, number, number] = [0, 0.2, 0];
const ORBIT_RADIUS = 3.6;

/** Samples of the aviation orbit: azimuth −38° → −360°, rising and falling. */
function orbitVia(): [number, number, number][] {
  const out: [number, number, number][] = [];
  const az0 = -38;
  const az1 = -360;
  const steps = 11;
  for (let i = 0; i < steps; i++) {
    const u = i / steps;
    const az = ((az0 + (az1 - az0) * u) * Math.PI) / 180;
    const h = 0.9 + 0.7 * Math.pow(Math.sin(Math.PI * u), 2);
    out.push([ORBIT_CENTRE[0] + Math.sin(az) * ORBIT_RADIUS, ORBIT_CENTRE[1] + h, ORBIT_CENTRE[2] + Math.cos(az) * ORBIT_RADIUS]);
  }
  return out;
}

/**
 * The shot list. Ten parked poses, one per beat, in world units around the
 * instrument (sphere radius 1, front at +Z). `frame: "case"` rides with the
 * aircraft: the pilot's view, where the bezel stays fixed and the horizon
 * moves. `via` points bend the path between poses; the aviation beat owns
 * the film's one full orbit through its own arrival.
 */
export const KEYFRAMES: Keyframe[] = [
  {
    id: "horizon",
    weight: 0.8,
    // A macro on the band, to the right of the aircraft symbol. The camera
    // sits on the equatorial plane and looks level, so the horizon is a
    // straight line; a hair above the strut, so nothing crosses the lens.
    position: [0.9, 0.06, 1.3],
    target: [0.62, 0, 0.78],
    lensMm: 85,
    hold: 0.6,
    viewOffsetY: { landscape: 0.12, portrait: 0 },
    // Portrait widens the lens, so the camera steps further right to keep
    // the aircraft symbol's bar out of the frame.
    portrait: { position: [1.0, 0.06, 1.35], target: [0.72, 0, 0.69] },
  },
  {
    id: "instrument",
    weight: 1,
    // Far enough that the bezel and both fork arms clear the frame edge
    // with the object composed in the right 58%.
    position: [3.4, 1.8, 4.35],
    target: [0, 0, 0],
    lensMm: 35,
    hold: 0.5,
  },
  {
    id: "capgemini",
    weight: 1,
    position: [0.3, 0.22, 3.05],
    target: [0, 0, 0],
    lensMm: 50,
    hold: 0.55,
    frame: "case",
  },
  {
    id: "intesa",
    weight: 1,
    position: [3.1, 0.5, 1.1],
    target: [0.2, 0, 0.2],
    lensMm: 40,
    hold: 0.55,
  },
  {
    id: "fincons-seavision",
    weight: 1,
    via: [[1.6, 3.0, 0.4]],
    position: [-1.2, 2.9, -1.6],
    target: [0, 0.1, 0],
    lensMm: 35,
    hold: 0.5,
  },
  {
    id: "atm",
    weight: 0.9,
    via: [[-2.8, 1.6, 1.2]],
    position: [0, 0, 3.0],
    target: [0, 0, 0],
    lensMm: 50,
    hold: 0.6,
    frame: "case",
  },
  {
    id: "skills",
    weight: 1,
    // Macro on the jewel bearing set into the outer ring's rim: the small
    // machined part that lets everything move freely. The way in passes in
    // front of the bezel, well clear of its rim.
    via: [[1.9, 0.55, 2.4]],
    position: [2.45, 0.35, 0.6],
    target: [1.45, 0, 0],
    lensMm: 100,
    hold: 0.55,
    drift: 20,
  },
  {
    id: "projects",
    weight: 1,
    // Around the front of the glass, low, never through it: the straight
    // line from the jewel macro would cross the dial.
    via: [[1.4, -1.6, 2.6]],
    position: [-2.3, -1.55, 2.9],
    target: [0, 0.1, 0],
    lensMm: 35,
    hold: 0.55,
    scrim: true,
  },
  {
    id: "aviation",
    weight: 1.2,
    via: orbitVia(),
    position: [0, 0.9, 3.6],
    target: [0, 0.2, 0],
    lensMm: 28,
    // The orbit owns most of the move in; a short departure remains so the
    // words can fade before the cut to the pilot's seat.
    hold: 0.36,
    arriveShare: 0.92,
    arriveFrac: 0.52,
    scrim: true,
  },
  {
    id: "contact",
    weight: 2.1,
    // The pilot's seat, a little further back than the chapter beats so the
    // post lights' spill on the bezel is in frame.
    position: [0, 0.15, 3.4],
    target: [0, 0, 0],
    lensMm: 40,
    hold: 0.65,
    frame: "case",
    viewOffsetY: { landscape: 0, portrait: 0.28 },
  },
];

export const BEAT_IDS = KEYFRAMES.map((k) => k.id);
