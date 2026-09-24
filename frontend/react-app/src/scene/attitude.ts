import { Euler, MathUtils, Quaternion } from "three";
import { smooth } from "../lib/beats";

/**
 * The film's attitude track: what the aircraft (the skeleton case) does,
 * written in degrees against "beat time" (beat index + progress inside
 * that beat, so 2.5 is halfway through the third beat). A pure function
 * of time, so scrolling up plays it backwards exactly.
 *
 * Beats: 0 horizon · 1 instrument · 2 capgemini · 3 intesa · 4 fincons/sea
 * vision · 5 atm · 6 skills · 7 projects · 8 aviation · 9 contact.
 */
export type Attitude = { pitch: number; roll: number; yaw: number };

type Key = { at: number } & Attitude;

// Roll: negative = left wing down (L), positive = right (R). No yaw: a real
// attitude indicator cannot show heading, so the case never turns.
const KEYS: Key[] = [
  { at: 0.0, pitch: 0, roll: 0, yaw: 0 },
  { at: 2.0, pitch: 0, roll: 0, yaw: 0 },
  { at: 2.6, pitch: 12, roll: 0, yaw: 0 }, // climb-out during chapter one
  { at: 3.0, pitch: 12, roll: 0, yaw: 0 },
  { at: 3.5, pitch: 8, roll: -20, yaw: 0 }, // the first turn, seen in profile
  { at: 4.0, pitch: 8, roll: -20, yaw: 0 },
  { at: 4.5, pitch: 5, roll: 12, yaw: 0 }, // over the top: roll through
  { at: 5.0, pitch: 5, roll: 0, yaw: 0 },
  { at: 5.45, pitch: 0, roll: 0, yaw: 0 }, // level flight, exactly
  { at: 7.0, pitch: 0, roll: 0, yaw: 0 },
  { at: 7.5, pitch: 3, roll: 0, yaw: 0 },
  { at: 8.0, pitch: 3, roll: 0, yaw: 0 },
  { at: 8.33, pitch: 4, roll: -30, yaw: 0 }, // one coordinated turn
  { at: 8.66, pitch: 4, roll: -30, yaw: 0 },
  { at: 9.0, pitch: 0, roll: 0, yaw: 0 },
  { at: 10.0, pitch: 0, roll: 0, yaw: 0 },
];

export function attitudeAt(beatTime: number, out: Attitude): Attitude {
  const t = MathUtils.clamp(beatTime, KEYS[0].at, KEYS[KEYS.length - 1].at);
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = b.at - a.at;
  const mix = span > 0 ? smooth((t - a.at) / span) : 1;
  out.pitch = MathUtils.lerp(a.pitch, b.pitch, mix);
  out.roll = MathUtils.lerp(a.roll, b.roll, mix);
  out.yaw = MathUtils.lerp(a.yaw, b.yaw, mix);
  return out;
}

/**
 * Visitor trim: a drag on the instrument adds a few degrees of pitch and
 * roll that spring back to the track on release. Kept outside React state
 * because it changes every frame while it settles.
 */
export const trim = {
  pitch: 0,
  roll: 0,
  targetPitch: 0,
  targetRoll: 0,
  active: false,
  /** Half-life of the spring-back, seconds. */
  halfLife: 0.18,
  step(dt: number) {
    const k = 1 - Math.pow(0.5, dt / this.halfLife);
    this.pitch += (this.targetPitch - this.pitch) * k;
    this.roll += (this.targetRoll - this.roll) * k;
    if (!this.active && Math.abs(this.pitch) < 0.01 && Math.abs(this.roll) < 0.01) {
      this.pitch = 0;
      this.roll = 0;
    }
  },
  get settled() {
    return !this.active && this.pitch === 0 && this.roll === 0;
  },
};

const euler = new Euler();

/** Clamped attitude with the visitor trim added: what the case actually does. */
export function effectiveAttitude(att: Attitude, withTrim = true): { pitch: number; roll: number } {
  return {
    pitch: MathUtils.clamp(att.pitch + (withTrim ? trim.pitch : 0), -35, 35),
    roll: MathUtils.clamp(att.roll + (withTrim ? trim.roll : 0), -45, 45),
  };
}

/** Radians for the cradle: nose up is a negative rotation about +X (bezel at +Z). */
export const cradleRotationX = (pitch: number) => MathUtils.degToRad(-pitch);
/** Radians for the case inside the cradle: right wing down lowers +X. */
export const caseRotationZ = (roll: number) => MathUtils.degToRad(-roll);

/**
 * Case orientation in the world: pitch about X (the cradle), then roll
 * about Z (the case in the cradle). Used by the camera rig for the
 * pilot's-view beats.
 */
export function caseQuaternion(att: Attitude, out: Quaternion, withTrim = true): Quaternion {
  const e = effectiveAttitude(att, withTrim);
  euler.set(cradleRotationX(e.pitch), 0, caseRotationZ(e.roll), "XYZ");
  return out.setFromEuler(euler);
}

/**
 * The lighting track, also in beat time: the key reveals the instrument in
 * the first two beats and hands over to the post lights in the epilogue.
 */
export type Lighting = {
  key: number;
  rim: number;
  post: number;
  exposure: number;
  bokeh: number;
  /** 0 = 4300 K studio key, 1 = 2800 K low sun (the aviation beat only). */
  warmth: number;
  /** The cold open's raking light across the horizon band; gone once the key is up. */
  raker: number;
};

type LightKey = { at: number } & Lighting;

const LIGHT_KEYS: LightKey[] = [
  // A whisper of key in the cold open: the rim sits behind the object and
  // cannot reach the front, and the horizon band must read from frame one.
  { at: 0.0, key: 3.5, rim: 40, post: 0, exposure: 0.9, bokeh: 3.5, warmth: 0, raker: 8 },
  { at: 0.6, key: 3.5, rim: 40, post: 0, exposure: 0.9, bokeh: 3.5, warmth: 0, raker: 8 },
  { at: 1.5, key: 18, rim: 36, post: 0, exposure: 1.05, bokeh: 1.6, warmth: 0, raker: 2.5 },
  { at: 2.5, key: 18, rim: 32, post: 0, exposure: 1.05, bokeh: 2.2, warmth: 0, raker: 0 },
  { at: 3.5, key: 18, rim: 32, post: 0, exposure: 1.05, bokeh: 1.6, warmth: 0, raker: 0 },
  { at: 4.5, key: 18, rim: 34, post: 0, exposure: 1.05, bokeh: 1.2, warmth: 0, raker: 0 },
  { at: 5.5, key: 18, rim: 30, post: 0, exposure: 1.05, bokeh: 1.6, warmth: 0, raker: 0 },
  { at: 6.5, key: 20, rim: 24, post: 0, exposure: 1.05, bokeh: 3.0, warmth: 0, raker: 0 },
  { at: 7.5, key: 18, rim: 34, post: 0, exposure: 1.05, bokeh: 1.2, warmth: 0, raker: 0 },
  { at: 8.0, key: 18, rim: 34, post: 0, exposure: 1.05, bokeh: 1.2, warmth: 0, raker: 0 },
  { at: 8.3, key: 14, rim: 46, post: 0, exposure: 1.05, bokeh: 1.0, warmth: 1, raker: 0 },
  { at: 8.9, key: 14, rim: 46, post: 0, exposure: 1.05, bokeh: 1.0, warmth: 1, raker: 0 },
  { at: 9.3, key: 10, rim: 30, post: 0.6, exposure: 1.0, bokeh: 0.5, warmth: 0, raker: 0 },
  { at: 9.6, key: 6, rim: 12, post: 1.6, exposure: 0.95, bokeh: 0, warmth: 0, raker: 0 },
  { at: 10.0, key: 6, rim: 12, post: 1.6, exposure: 0.95, bokeh: 0, warmth: 0, raker: 0 },
];

export function lightingAt(beatTime: number, out: Lighting): Lighting {
  const t = MathUtils.clamp(beatTime, 0, 10);
  let i = 0;
  while (i < LIGHT_KEYS.length - 2 && t > LIGHT_KEYS[i + 1].at) i++;
  const a = LIGHT_KEYS[i];
  const b = LIGHT_KEYS[i + 1];
  const span = b.at - a.at;
  const mix = span > 0 ? smooth((t - a.at) / span) : 1;
  out.key = MathUtils.lerp(a.key, b.key, mix);
  out.rim = MathUtils.lerp(a.rim, b.rim, mix);
  out.post = MathUtils.lerp(a.post, b.post, mix);
  out.exposure = MathUtils.lerp(a.exposure, b.exposure, mix);
  out.bokeh = MathUtils.lerp(a.bokeh, b.bokeh, mix);
  out.warmth = MathUtils.lerp(a.warmth, b.warmth, mix);
  out.raker = MathUtils.lerp(a.raker, b.raker, mix);
  return out;
}

/** Beat time from progress: beat index plus the fraction inside the beat. */
export function beatTimeAt(progress: number, ranges: { start: number; end: number }[]): number {
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (progress < r.end || i === ranges.length - 1) {
      const span = r.end - r.start;
      const local = span > 0 ? MathUtils.clamp((progress - r.start) / span, 0, 1) : 1;
      return i + local;
    }
  }
  return ranges.length;
}
