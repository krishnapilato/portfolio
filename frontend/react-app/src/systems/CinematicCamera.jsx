/**
 * CinematicCamera — automated camera path system for transitions.
 *
 * When activated, takes control of the camera and moves it along a
 * predefined keyframe path (linear interpolation between waypoints).
 * User input is paused during cinematic sequences.
 *
 * Performance rules:
 *   - No heavy postprocessing during animation
 *   - Uses simple lerp (no spring physics overhead)
 *   - Camera paths are pre-computed
 */

import { useFrame } from "@react-three/fiber";
import { useRef, memo } from "react";
import * as THREE from "three";
import { useAppStore } from "../store/index.js";

// Reusable temp vector for lerp target (avoids per-frame allocation)
const _lerpTarget = new THREE.Vector3();

/**
 * Pre-defined camera paths for different cinematic events.
 * Each path is an array of { position, lookAt, duration } keyframes.
 */
const PATHS = {
  entry: [
    { position: [0, 0, 20], lookAt: [0, 0, 0], duration: 2 },
    { position: [0, 0.5, 8], lookAt: [0, 0, -10], duration: 2 },
    { position: [0, 0, 5], lookAt: [0, 0, -14], duration: 1.5 },
  ],
  zoneTransition: [
    { position: [0, 1, 5], lookAt: [0, 0, -5], duration: 1 },
    { position: [0, 0, 2], lookAt: [0, 0, -14], duration: 1.5 },
  ],
};

function CinematicCamera({ pathName = null, onComplete }) {
  const cinematicActive = useAppStore((s) => s.cinematicActive);
  const elapsedRef = useRef(0);
  const segmentRef = useRef(0);
  const posV = useRef(new THREE.Vector3());
  const lookV = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!cinematicActive || !pathName) return;

    const path = PATHS[pathName];
    if (!path) return;

    const seg = segmentRef.current;
    if (seg >= path.length - 1) {
      onComplete?.();
      return;
    }

    elapsedRef.current += delta;
    const from = path[seg];
    const to = path[seg + 1];
    const t = Math.min(elapsedRef.current / to.duration, 1);

    // Smooth step for cinematic feel
    const smooth = t * t * (3 - 2 * t);

    posV.current.set(...from.position).lerp(
      _lerpTarget.set(...to.position),
      smooth,
    );
    lookV.current.set(...from.lookAt).lerp(
      _lerpTarget.set(...to.lookAt),
      smooth,
    );

    state.camera.position.copy(posV.current);
    state.camera.lookAt(lookV.current);

    if (t >= 1) {
      segmentRef.current++;
      elapsedRef.current = 0;
    }
  });

  return null;
}

export default memo(CinematicCamera);
