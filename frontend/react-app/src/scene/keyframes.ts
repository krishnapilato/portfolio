import type { Keyframe } from "./CameraRig";

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
    position: [0.05, 0.02, 1.62],
    target: [0, 0, 1.0],
    lensMm: 85,
    hold: 0.6,
    viewOffsetY: { landscape: 0.12, portrait: 0.2 },
    portrait: { position: [0.05, 0.02, 1.7] },
  },
  {
    id: "instrument",
    weight: 1,
    position: [2.6, 1.4, 3.4],
    target: [0, 0, 0],
    lensMm: 40,
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
    position: [1.62, 0.36, 1.05],
    target: [1.43, 0, 0.02],
    lensMm: 100,
    hold: 0.55,
    drift: 20,
  },
  {
    id: "projects",
    weight: 1,
    position: [-2.3, -1.55, 2.9],
    target: [0, 0.1, 0],
    lensMm: 35,
    hold: 0.55,
  },
  {
    id: "aviation",
    weight: 1.2,
    via: orbitVia(),
    position: [0, 0.9, 3.6],
    target: [0, 0.2, 0],
    lensMm: 28,
    hold: 0.4,
    arriveShare: 0.92,
    arriveFrac: 0.6,
  },
  {
    id: "contact",
    weight: 2.1,
    position: [0, 0, 2.8],
    target: [0, 0, 0],
    lensMm: 50,
    hold: 0.65,
    frame: "case",
    viewOffsetY: { landscape: 0, portrait: 0.28 },
  },
];

export const BEAT_IDS = KEYFRAMES.map((k) => k.id);
