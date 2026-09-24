import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from "three";
import { computeRanges, fovFromLens, holdEase, localT, smooth } from "../lib/beats";
import { useTimeline } from "../lib/store";

/** One parked camera pose per beat; the rig travels between them. */
export type Keyframe = {
  id: string;
  weight: number;
  position: [number, number, number];
  target: [number, number, number];
  /** 35mm-equivalent focal length: the HORIZONTAL framing on a 36 mm frame. */
  lensMm: number;
  /** Dutch angle in degrees; kept small so nobody gets seasick. */
  roll?: number;
  /** Fraction of the beat's scroll range spent parked on this pose. */
  hold?: number;
  /**
   * Overrides used when the viewport is taller than wide, so a phone can
   * frame the object above or below its text block instead of behind it.
   */
  portrait?: {
    position?: [number, number, number];
    target?: [number, number, number];
    lensMm?: number;
  };
};

/** Widest vertical field of view allowed before the rig dollies back instead. */
const MAX_VFOV = 66;
/** Viewports narrower than this ratio use the portrait keyframe overrides. */
const PORTRAIT_ASPECT = 0.9;

type Props = {
  keyframes: Keyframe[];
  /** Seconds to reach ~63% of the way to the target: the camera's mass. */
  smoothTime?: number;
  /** Pointer parallax amplitude in scene units at full pointer deflection. */
  parallax?: number;
};

const desiredPosition = new Vector3();
const desiredTarget = new Vector3();
const parallaxOffset = new Vector3();
const right = new Vector3();
const up = new Vector3();
const forward = new Vector3();
const UP = new Vector3(0, 1, 0);

/**
 * Scroll → camera. Progress is turned into a continuous "camera time" that
 * parks on each keyframe for the beat's hold and eases between them, then
 * position and aim are traced along Catmull-Rom splines through the poses,
 * so every move is an arc with mass rather than a straight line. A small
 * pointer parallax lets the visitor lean into the frame. Nothing here
 * touches React state; it runs entirely inside the render loop.
 */
export default function CameraRig({ keyframes, smoothTime = 0.42, parallax = 0.08 }: Props) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const state = useRef({
    target: new Vector3(...keyframes[0].target),
    fov: fovFromLens(keyframes[0].lensMm),
    roll: 0,
    px: 0,
    py: 0,
    initialised: false,
  });

  const size = useThree((s) => s.size);
  const portrait = size.width / Math.max(size.height, 1) < PORTRAIT_ASPECT;

  const { ranges, positionCurve, targetCurve, lenses, last } = useMemo(() => {
    const ranges = computeRanges(keyframes);
    const pick = (k: Keyframe) => (portrait && k.portrait ? { ...k, ...k.portrait } : k);
    const positions = keyframes.map((k) => new Vector3(...pick(k).position));
    const targets = keyframes.map((k) => new Vector3(...pick(k).target));
    const lenses = keyframes.map((k) => pick(k).lensMm);
    // A single keyframe cannot form a curve; duplicate it so evaluation is safe.
    if (positions.length === 1) {
      positions.push(positions[0].clone());
      targets.push(targets[0].clone());
      lenses.push(lenses[0]);
    }
    return {
      ranges,
      positionCurve: new CatmullRomCurve3(positions, false, "centripetal", 0.5),
      targetCurve: new CatmullRomCurve3(targets, false, "centripetal", 0.5),
      lenses,
      last: keyframes.length - 1,
    };
  }, [keyframes, portrait]);

  useFrame((_, delta) => {
    const t = useTimeline.getState();
    const dt = Math.min(delta, 1 / 20);
    const s = state.current;

    // Which beat, and how far through it.
    let beat = last;
    for (let i = 0; i < ranges.length; i++) {
      if (t.progress < ranges[i].end) { beat = i; break; }
    }
    const kf = keyframes[beat];
    const eased = holdEase(localT(ranges[beat], t.progress), kf.hold ?? 0.55);
    // Continuous camera time: parked at `beat`, drifting ±0.5 towards neighbours.
    const time = MathUtils.clamp(beat - 0.5 + eased, 0, last);
    const u = last > 0 ? time / last : 0;

    positionCurve.getPointAt(u, desiredPosition);
    targetCurve.getPointAt(u, desiredTarget);
    const lo = Math.floor(time);
    const hi = Math.min(lo + 1, last);
    const mix = smooth(time - lo);
    const lens = MathUtils.lerp(lenses[lo], lenses[hi], mix);
    const roll = MathUtils.degToRad(MathUtils.lerp(keyframes[lo].roll ?? 0, keyframes[hi].roll ?? 0, mix));

    // The lens defines the HORIZONTAL framing, so the same width of the
    // scene is visible on every screen. On tall screens the vertical fov
    // grows to keep that width; past MAX_VFOV the camera dollies back
    // instead, because a very wide lens would warp the object's edges.
    const aspect = size.width / Math.max(size.height, 1);
    let fov = fovFromLens(lens, aspect);
    if (fov > MAX_VFOV) {
      const wanted = Math.tan(MathUtils.degToRad(fov / 2));
      const allowed = Math.tan(MathUtils.degToRad(MAX_VFOV / 2));
      forward.subVectors(desiredPosition, desiredTarget);
      desiredPosition.copy(desiredTarget).addScaledVector(forward, wanted / allowed);
      fov = MAX_VFOV;
    }

    // Pointer parallax in the camera's own frame, damped so it feels held, not jittery.
    const amp = t.reducedMotion ? 0 : parallax;
    s.px = MathUtils.damp(s.px, t.pointerX * amp, 4, dt);
    s.py = MathUtils.damp(s.py, t.pointerY * amp, 4, dt);

    if (t.reducedMotion || !s.initialised) {
      // Cuts, not moves: land on the pose immediately.
      camera.position.copy(desiredPosition);
      s.target.copy(desiredTarget);
      s.fov = fov;
      s.roll = roll;
      s.initialised = true;
    } else {
      const lambda = 1 / Math.max(smoothTime, 0.01);
      camera.position.x = MathUtils.damp(camera.position.x, desiredPosition.x, lambda, dt);
      camera.position.y = MathUtils.damp(camera.position.y, desiredPosition.y, lambda, dt);
      camera.position.z = MathUtils.damp(camera.position.z, desiredPosition.z, lambda, dt);
      s.target.x = MathUtils.damp(s.target.x, desiredTarget.x, lambda * 1.15, dt);
      s.target.y = MathUtils.damp(s.target.y, desiredTarget.y, lambda * 1.15, dt);
      s.target.z = MathUtils.damp(s.target.z, desiredTarget.z, lambda * 1.15, dt);
      s.fov = MathUtils.damp(s.fov, fov, lambda * 0.8, dt);
      s.roll = MathUtils.damp(s.roll, roll, lambda * 0.8, dt);
    }

    // Build the camera frame from the aim, then apply parallax and roll.
    forward.subVectors(s.target, camera.position).normalize();
    right.crossVectors(forward, UP).normalize();
    up.crossVectors(right, forward).normalize();
    parallaxOffset.copy(right).multiplyScalar(s.px).addScaledVector(up, s.py);
    camera.position.add(parallaxOffset);
    camera.lookAt(s.target);
    camera.position.sub(parallaxOffset);
    if (s.roll !== 0) camera.rotateZ(s.roll);
    if (Math.abs(camera.fov - s.fov) > 1e-3) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    }

    if (t.beat !== beat) t.set({ beat });
  });

  return null;
}
