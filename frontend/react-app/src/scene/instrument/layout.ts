import type { Tier } from "../../lib/store";
import type { RingSpec } from "./geometry";

/**
 * Dimensions of the instrument in scene units (sphere radius = 1, +Z is the
 * front, +Y up). Every part reads from here so the parts agree with each
 * other and with the camera keyframes.
 */

export const LATHE_SEGMENTS: Record<Tier, number> = { high: 192, mid: 128, low: 96 };
/** Segments for the small turned parts (pins, bosses, lamps, stem). */
export const SMALL_SEGMENTS: Record<Tier, number> = { high: 48, mid: 32, low: 24 };

export const INNER_RING: RingSpec = { meanRadius: 1.14, radial: 0.1, axial: 0.16, chamfer: 0.012 };
export const OUTER_RING: RingSpec = { meanRadius: 1.34, radial: 0.12, axial: 0.2, chamfer: 0.012 };
export const BEZEL: RingSpec = { meanRadius: 1.58, radial: 0.14, axial: 0.1, chamfer: 0.012 };
/** Centre of the bezel ring along Z. */
export const BEZEL_Z = 1.15;

/** Pivot pins on the X axis, bridging the inner ring (outer radius 1.19) and the outer ring (inner radius 1.28). */
export const PIVOT_PIN = {
  radius: 0.05,
  length: 0.14,
  x: 1.235,
  chamfer: 0.005,
  collar: { radius: 0.062, from: 0.012, to: 0.045 },
} as const;

/** Bank-pointer triangle on the outer ring's front face at 12 o'clock. */
export const BANK_POINTER = { base: 1.36, tip: 1.48, halfWidth: 0.035, depth: 0.02 } as const;

/** Rear bearing: the boss behind the spider hub and the journal that passes through the hub. */
export const BEARING = {
  boss: { radius: 0.16, length: 0.18, z: -1.3 },
  shaft: { radius: 0.09, length: 0.28, z: -1.11 },
  /** L bracket from the ring's 6 o'clock back edge to the boss. */
  bracket: { section: 0.08 },
} as const;

/** Spider hub on the case that holds the bearing. */
export const HUB = { radius: 0.2, length: 0.12, z: -1.05 } as const;

export const RIB = {
  section: 0.05,
  length: 2.2,
  /** Radius of the rib centres = the bezel's mean radius. */
  radius: 1.58,
  /** Centre z: the rib runs from the bezel (z 1.15) back to the spider (z -1.05). */
  z: 0.05,
  angles: [45, 135, 225, 315],
} as const;
export const SPIDER_ANGLES = [90, 210, 330] as const;

/** The case's rear axle: from behind the outer gimbal's boss into the cradle's roll boss. */
export const REAR_STUB = { radius: 0.1, length: 0.34, z: -1.56 } as const;

export const POST_LIGHT = {
  radius: 0.035,
  length: 0.08,
  /** Degrees either side of 12 o'clock. */
  angle: 35,
  color: "#FFB46B",
  /** emissiveIntensity at glow = 1: above the bloom threshold (1.1) so the lamps bloom in the epilogue. */
  emissiveScale: 3,
} as const;

/**
 * Where the parent puts the two practical PointLights, in the case's own
 * frame (= world while the case is at rest): just ahead of each lamp's tip.
 */
export const POST_LIGHT_POSITIONS: readonly [number, number, number][] = [35, -35].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [Math.sin(a) * BEZEL.meanRadius, Math.cos(a) * BEZEL.meanRadius, BEZEL_Z + BEZEL.axial / 2 + POST_LIGHT.length + 0.02] as [
    number,
    number,
    number,
  ];
});

export const GLASS = { radius: 1.5, thickness: 0.03, z: 1.13 } as const;

export const SYMBOL = {
  z: 1.2,
  /** Each wing bar: length (x), height (y), depth (z). */
  bar: [0.42, 0.035, 0.02],
  gap: 0.1,
  dot: 0.03,
  strut: 0.008,
  color: "#F2A23A",
  emissiveIntensity: 0.35,
} as const;
mport type { Tier } from "../../lib/store";
import type { RingSpec } from "./geometry";

/**
 * Dimensions of the instrument in scene units (sphere radius = 1, +Z is the
 * front, +Y up). Every part reads from here so the parts agree with each
 * other and with the camera keyframes.
 */

export const LATHE_SEGMENTS: Record<Tier, number> = { high: 192, mid: 128, low: 96 };
/** Segments for the small turned parts (pins, bosses, lamps, stem). */
export const SMALL_SEGMENTS: Record<Tier, number> = { high: 48, mid: 32, low: 24 };

export const INNER_RING: RingSpec = { meanRadius: 1.14, radial: 0.1, axial: 0.16, chamfer: 0.012 };
export const OUTER_RING: RingSpec = { meanRadius: 1.34, radial: 0.12, axial: 0.2, chamfer: 0.012 };
export const BEZEL: RingSpec = { meanRadius: 1.58, radial: 0.14, axial: 0.1, chamfer: 0.012 };
/** Centre of the bezel ring along Z. */
export const BEZEL_Z = 1.15;

/** Pivot pins on the X axis, bridging the inner ring (outer radius 1.19) and the outer ring (inner radius 1.28). */
export const PIVOT_PIN = {
  radius: 0.05,
  length: 0.14,
  x: 1.235,
  chamfer: 0.005,
  collar: { radius: 0.062, from: 0.012, to: 0.045 },
} as const;

/** Bank-pointer triangle on the outer ring's front face at 12 o'clock. */
export const BANK_POINTER = { base: 1.36, tip: 1.48, halfWidth: 0.035, depth: 0.02 } as const;

/** Rear bearing: the boss behind the spider hub and the journal that passes through the hub. */
export const BEARING = {
  boss: { radius: 0.16, length: 0.18, z: -1.3 },
  shaft: { radius: 0.09, length: 0.28, z: -1.11 },
  /** L bracket from the ring's 6 o'clock back edge to the boss. */
  bracket: { section: 0.08 },
} as const;

/** Spider hub on the case that holds the bearing. */
export const HUB = { radius: 0.2, length: 0.12, z: -1.05 } as const;

export const RIB = {
  section: 0.05,
  length: 2.2,
  /** Radius of the rib centres = the bezel's mean radius. */
  radius: 1.58,
  /** Centre z: the rib runs from the bezel (z 1.15) back to the spider (z -1.05). */
  z: 0.05,
  angles: [45, 135, 225, 315],
} as const;
export const SPIDER_ANGLES = [90, 210, 330] as const;

/** The case's rear axle: from behind the outer gimbal's boss into the cradle's roll boss. */
export const REAR_STUB = { radius: 0.1, length: 0.34, z: -1.56 } as const;

export const POST_LIGHT = {
  radius: 0.035,
  length: 0.08,
  /** Degrees either side of 12 o'clock. */
  angle: 35,
  color: "#FFB46B",
  /** emissiveIntensity at glow = 1: above the bloom threshold (1.1) so the lamps bloom in the epilogue. */
  emissiveScale: 3,
} as const;

/**
 * Where the parent puts the two practical PointLights, in the case's own
 * frame (= world while the case is at rest): just ahead of each lamp's tip.
 */
export const POST_LIGHT_POSITIONS: readonly [number, number, number][] = [35, -35].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [Math.sin(a) * BEZEL.meanRadius, Math.cos(a) * BEZEL.meanRadius, BEZEL_Z + BEZEL.axial / 2 + POST_LIGHT.length + 0.02] as [
    number,
    number,
    number,
  ];
});

export const GLASS = { radius: 1.5, thickness: 0.03, z: 1.13 } as const;

export const SYMBOL = {
  z: 1.2,
  /** Each wing bar: length (x), height (y), depth (z). */
  bar: [0.42, 0.035, 0.02],
  gap: 0.1,
  dot: 0.03,
  strut: 0.008,
  color: "#F2A23A",
  emissiveIntensity: 0.35,
} as const;

export const MOUNT = {
  pedestal: { radius: 0.35, height: 0.25, y: -2.15, chamfer: 0.012 },
  stem: { radius: 0.06, flangeRadius: 0.11, flangeHeight: 0.024 },
  ball: { radius: 0.09, y: -1.72 },
  bolts: { count: 8, radius: 0.04, height: 0.025, ring: 0.29 },
  /** One paint tile covers this many scene units. */
  paintTile: 0.5,
} as const;
