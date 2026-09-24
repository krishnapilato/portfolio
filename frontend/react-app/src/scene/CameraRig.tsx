import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { cameraTime, computeRanges, fovFromLens, localT, phasesOf, smooth } from "../lib/beats";
import { useTimeline } from "../lib/store";
import { attitudeAt, beatTimeAt, trim, type Attitude } from "./attitude";
import { caseQuaternion } from "./kinematics";
import type { Keyframe } from "./keyframes";
import { cameraState } from "./palette";

/** Widest vertical field of view allowed before the rig dollies back instead. */
const MAX_VFOV = 62;
/** Viewports narrower than this ratio use the portrait keyframe overrides (the stylesheet's 9/10). */
const PORTRAIT_ASPECT = 0.9;
/** Landscape: the object lives in the right 58%; ultrawide a little less; portrait: the top 55%. */
const LANDSCAPE_SHIFT = 0.21;
const ULTRAWIDE_SHIFT = 0.15;
const PORTRAIT_SHIFT = 0.22;

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
const spin = new Vector3();
const caseQuat = new Quaternion();
const blendQuat = new Quaternion();
const IDENTITY = new Quaternion();
const WORLD_UP = new Vector3(0, 1, 0);
const attitude: Attitude = { pitch: 0, roll: 0, yaw: 0 };

/** Arc-length parameter (0..1) of every pose along a curve built through poses and via points. */
function poseParameters(curve: CatmullRomCurve3, poseIndices: number[], pointCount: number) {
  const divisions = Math.max(400, pointCount * 40);
  const lengths = curve.getLengths(divisions);
  const total = lengths[lengths.length - 1] || 1;
  return poseIndices.map((index) => {
    const t = pointCount > 1 ? index / (pointCount - 1) : 0;
    const k = t * divisions;
    const lo = Math.floor(k);
    const hi = Math.min(lo + 1, divisions);
    const length = MathUtils.lerp(lengths[lo], lengths[hi], k - lo);
    return length / total;
  });
}

/**
 * Scroll → camera. Progress becomes a continuous "camera time" that parks
 * on each keyframe for the beat's hold and eases through the segments
 * between poses; position and aim follow Catmull-Rom splines through the
 * poses and their via points, so every move is an arc with mass and the
 * aviation orbit is simply a longer arc. Poses in the aircraft's frame are
 * rotated by the case attitude, blended in and out so the camera can climb
 * into the cockpit and back out without a cut. Nothing here touches React
 * state.
 */
export default function CameraRig({ keyframes, smoothTime = 0.28, parallax = 0.08 }: Props) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(size.height, 1);
  const portrait = aspect < PORTRAIT_ASPECT;
  // Ultrawide means a wide monitor, not a phone on its side: a landscape
  // phone has the same aspect and needs the full shift to clear its column.
  const ultrawide = aspect > 2.1 && size.width >= 1600;

  const state = useRef({
    target: new Vector3(...keyframes[0].target),
    up: new Vector3(0, 1, 0),
    fov: fovFromLens(keyframes[0].lensMm),
    px: 0,
    py: 0,
    offsetY: 0,
    initialised: false,
    /** The view offset changed this frame: the projection must be rebuilt. */
    projectionDirty: false,
  });

  const rig = useMemo(() => {
    const ranges = computeRanges(keyframes);
    const pick = (k: Keyframe) => (portrait && k.portrait ? { ...k, ...k.portrait } : k);
    const points: Vector3[] = [];
    const targets: Vector3[] = [];
    const poseIndices: number[] = [];
    keyframes.forEach((k, i) => {
      const pose = pick(k);
      if (i > 0 && k.via) for (const v of k.via) points.push(new Vector3(...v));
      poseIndices.push(points.length);
      points.push(new Vector3(...pose.position));
      targets.push(new Vector3(...pose.target));
    });
    if (points.length === 1) points.push(points[0].clone());
    const positionCurve = new CatmullRomCurve3(points, false, "centripetal", 0.5);
    const params = poseParameters(positionCurve, poseIndices, points.length);
    return {
      ranges,
      positionCurve,
      targets,
      params,
      lenses: keyframes.map((k) => pick(k).lensMm),
      blends: keyframes.map((k) => (k.frame === "case" ? 1 : 0)),
      drifts: keyframes.map((k) => k.drift ?? 0),
      phases: keyframes.map((k) => phasesOf(k)),
      offsets: keyframes.map((k) => (portrait ? k.viewOffsetY?.portrait ?? 0 : k.viewOffsetY?.landscape ?? 0)),
      last: keyframes.length - 1,
    };
  }, [keyframes, portrait]);

  // Composition: keep the object out of the text column without moving the
  // look direction. A view offset shifts the projection, so every pose
  // stays composed as designed and the text never overlaps the object.
  useEffect(() => {
    const { width, height } = size;
    const shift = portrait ? 0 : ultrawide ? ULTRAWIDE_SHIFT : LANDSCAPE_SHIFT;
    const base = portrait ? PORTRAIT_SHIFT : 0;
    camera.setViewOffset(width, height, -width * shift, height * (base + state.current.offsetY), width, height);
    camera.updateProjectionMatrix();
    invalidate();
    return () => camera.clearViewOffset();
  }, [camera, size, portrait, ultrawide, invalidate]);

  useFrame((_, delta) => {
    const t = useTimeline.getState();
    const dt = Math.min(delta, 1 / 20);
    const s = state.current;
    const { ranges, positionCurve, targets, params, lenses, blends, drifts, phases, offsets, last } = rig;

    // Which beat, how far through it, and where that puts the camera in time.
    let beat = last;
    for (let i = 0; i < ranges.length; i++) {
      if (t.progress < ranges[i].end) { beat = i; break; }
    }
    const local = localT(ranges[beat], t.progress);
    // Reduced motion: cuts, not moves. The camera sits on the current beat's
    // pose and changes only at the beat boundary, while the words are away.
    const time = t.reducedMotion ? beat : MathUtils.clamp(cameraTime(keyframes, beat, local), 0, last);
    const lo = Math.floor(time);
    const hi = Math.min(lo + 1, last);
    const frac = time - lo;
    const u = MathUtils.lerp(params[lo], params[hi], frac);

    positionCurve.getPointAt(u, desiredPosition);
    // The aim moves straight from pose to pose with the same easing as the
    // dolly: a look target that swings along a curve would feel like a pan
    // the director never called for.
    const mix = smooth(frac);
    desiredTarget.lerpVectors(targets[lo], targets[hi], mix);
    const lens = MathUtils.lerp(lenses[lo], lenses[hi], mix);

    // Drift: a continuous small orbit around the target across the beat,
    // windowed by the arrival and departure so it is zero at both ends of
    // the beat and the neighbouring moves never see a step.
    const drift = drifts[beat];
    if (drift !== 0 && !t.reducedMotion) {
      const p = phases[beat];
      const window =
        p.arrive > 0 && local < p.arrive
          ? smooth(local / p.arrive)
          : p.leave > 0 && local > 1 - p.leave
            ? smooth((1 - local) / p.leave)
            : 1;
      const angle = MathUtils.degToRad(drift * (local - 0.5) * window);
      spin.subVectors(desiredPosition, desiredTarget).applyAxisAngle(WORLD_UP, angle);
      desiredPosition.copy(desiredTarget).add(spin);
    }

    // Ride with the aircraft when the pose asks for it.
    const blend = MathUtils.lerp(blends[lo], blends[hi], mix);
    up.copy(WORLD_UP);
    if (blend > 0) {
      caseQuaternion(attitudeAt(beatTimeAt(t.progress, ranges), attitude), caseQuat);
      blendQuat.copy(IDENTITY).slerp(caseQuat, blend);
      desiredPosition.applyQuaternion(blendQuat);
      desiredTarget.applyQuaternion(blendQuat);
      up.applyQuaternion(blendQuat);
    }

    // The lens defines the HORIZONTAL framing, so the same width of the
    // scene is visible on every screen. On tall screens the vertical fov
    // grows to keep that width; past MAX_VFOV the camera dollies back
    // instead, because a very wide lens would warp the object's edges.
    let fov = fovFromLens(lens, aspect);
    if (fov > MAX_VFOV) {
      const wanted = Math.tan(MathUtils.degToRad(fov / 2));
      const allowed = Math.tan(MathUtils.degToRad(MAX_VFOV / 2));
      forward.subVectors(desiredPosition, desiredTarget);
      desiredPosition.copy(desiredTarget).addScaledVector(forward, Math.min(wanted / allowed, 1.6));
      fov = MAX_VFOV;
    }

    // Per-beat vertical framing (the cold open sits its horizon high).
    const offsetY = MathUtils.lerp(offsets[lo], offsets[hi], mix);
    if (Math.abs(offsetY - s.offsetY) > 1e-3) {
      s.offsetY = offsetY;
      const shift = portrait ? 0 : ultrawide ? ULTRAWIDE_SHIFT : LANDSCAPE_SHIFT;
      const base = portrait ? PORTRAIT_SHIFT : 0;
      camera.setViewOffset(size.width, size.height, -size.width * shift, size.height * (base + offsetY), size.width, size.height);
      s.projectionDirty = true;
    }

    // Pointer parallax in the camera's own frame, damped so it feels held.
    const amp = t.reducedMotion || trim.active ? 0 : parallax;
    s.px = MathUtils.damp(s.px, t.pointerX * amp, 4, dt);
    s.py = MathUtils.damp(s.py, t.pointerY * amp, 4, dt);

    let moving: boolean;
    if (t.reducedMotion || !s.initialised) {
      // Cuts, not moves: land on the pose immediately, and ask for a frame
      // only when the pose actually changed, so a parked page stays idle.
      moving =
        !s.initialised ||
        camera.position.distanceToSquared(desiredPosition) > 1e-10 ||
        s.target.distanceToSquared(desiredTarget) > 1e-10 ||
        Math.abs(s.fov - fov) > 1e-4 ||
        s.projectionDirty ||
        Math.abs(s.px - t.pointerX * amp) > 1e-4 ||
        Math.abs(s.py - t.pointerY * amp) > 1e-4;
      camera.position.copy(desiredPosition);
      s.target.copy(desiredTarget);
      s.up.copy(up);
      s.fov = fov;
      s.initialised = true;
    } else {
      const lambda = 1 / Math.max(smoothTime, 0.01);
      const before = camera.position.distanceToSquared(desiredPosition) + s.target.distanceToSquared(desiredTarget);
      camera.position.x = MathUtils.damp(camera.position.x, desiredPosition.x, lambda, dt);
      camera.position.y = MathUtils.damp(camera.position.y, desiredPosition.y, lambda, dt);
      camera.position.z = MathUtils.damp(camera.position.z, desiredPosition.z, lambda, dt);
      s.target.x = MathUtils.damp(s.target.x, desiredTarget.x, lambda * 1.15, dt);
      s.target.y = MathUtils.damp(s.target.y, desiredTarget.y, lambda * 1.15, dt);
      s.target.z = MathUtils.damp(s.target.z, desiredTarget.z, lambda * 1.15, dt);
      s.up.x = MathUtils.damp(s.up.x, up.x, lambda, dt);
      s.up.y = MathUtils.damp(s.up.y, up.y, lambda, dt);
      s.up.z = MathUtils.damp(s.up.z, up.z, lambda, dt);
      s.fov = MathUtils.damp(s.fov, fov, lambda * 0.8, dt);
      moving =
        before > 1e-7 ||
        Math.abs(s.fov - fov) > 1e-3 ||
        Math.abs(s.px - t.pointerX * amp) > 1e-4 ||
        Math.abs(s.py - t.pointerY * amp) > 1e-4;
    }

    // Build the camera frame from the aim, then apply the parallax offset.
    forward.subVectors(s.target, camera.position).normalize();
    right.crossVectors(forward, s.up).normalize();
    up.crossVectors(right, forward).normalize();
    parallaxOffset.copy(right).multiplyScalar(s.px).addScaledVector(up, s.py);
    camera.up.copy(up);
    camera.position.add(parallaxOffset);
    camera.lookAt(s.target);
    camera.position.sub(parallaxOffset);
    if (s.projectionDirty || Math.abs(camera.fov - s.fov) > 1e-3) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
      s.projectionDirty = false;
    }
    cameraState.focusDistance = camera.position.distanceTo(s.target);
    cameraState.position[0] = camera.position.x;
    cameraState.position[1] = camera.position.y;
    cameraState.position[2] = camera.position.z;
    cameraState.target[0] = s.target.x;
    cameraState.target[1] = s.target.y;
    cameraState.target[2] = s.target.z;
    cameraState.fov = camera.fov;
    cameraState.time = time;

    // Render-on-demand: keep asking for frames until everything has settled.
    if (moving || !trim.settled) invalidate();
  });

  return null;
}
