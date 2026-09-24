import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Group, MathUtils, PointLight } from "three";
import { computeRanges } from "../lib/beats";
import { useTimeline } from "../lib/store";
import {
  attitudeAt,
  beatTimeAt,
  caseRotationZ,
  cradleRotationX,
  effectiveAttitude,
  lightingAt,
  trim,
  type Attitude,
  type Lighting,
} from "./attitude";
import Bezel from "./instrument/Bezel";
import Cage from "./instrument/Cage";
import Cradle from "./instrument/Cradle";
import HorizonSphere from "./instrument/HorizonSphere";
import InnerRing from "./instrument/InnerRing";
import Jewels from "./instrument/Jewels";
import OuterRing from "./instrument/OuterRing";
import Stand from "./instrument/Stand";
import { KEYFRAMES } from "./keyframes";
import { PALETTE } from "./palette";

const RANGES = computeRanges(KEYFRAMES);
const attitude: Attitude = { pitch: 0, roll: 0, yaw: 0 };
/** react-three-fiber's event target: pointer capture that survives leaving the mesh. */
type PointerTarget = { setPointerCapture?: (id: number) => void; releasePointerCapture?: (id: number) => void };
const lighting: Lighting = { key: 18, rim: 32, post: 0, exposure: 1.05, bokeh: 1.6, warmth: 0, raker: 0 };
/** Degrees of trim per pixel of drag, and the most a hand can add. */
const TRIM_GAIN = 0.05;
const TRIM_LIMIT = 8;
/** Practical lights: just ahead of the bezel, 35° either side of top, in the case frame. */
const PRACTICALS: [number, number, number][] = [
  [-0.85, 1.2, 1.36],
  [0.85, 1.2, 1.36],
];

/**
 * The instrument in its bench fixture, assembled the way the real mechanism
 * works. The stand is fixed to the floor. The cradle pitches on the fork's
 * trunnions, and the case rolls inside the cradle: together they are the
 * aircraft. The roll gimbal counter-rotates the roll, so it follows pitch
 * only; the pitch gimbal counter-rotates the pitch, so it and the horizon
 * sphere stay level in both axes. Seen from the side, the rings visibly do
 * their job while the horizon holds.
 */
export default function Instrument() {
  const cradleGroup = useRef<Group>(null);
  const caseGroup = useRef<Group>(null);
  const outerGroup = useRef<Group>(null);
  const innerGroup = useRef<Group>(null);
  const bezelGroup = useRef<Group>(null);
  const practicalA = useRef<PointLight>(null);
  const practicalB = useRef<PointLight>(null);
  const invalidate = useThree((s) => s.invalidate);
  const drag = useRef({ id: -1, x: 0, y: 0, target: null as PointerTarget | null });
  const last = useRef({ pitch: NaN, roll: NaN, post: NaN });
  // The post lights glow from inside the object in the epilogue. The bezel
  // takes the glow as a prop, so it is quantised to twenty steps: a handful
  // of renders during the transition, none while the lights are steady.
  const [glowStep, setGlowStep] = useState(0);

  useFrame((_, delta) => {
    const t = useTimeline.getState();
    const beatTime = beatTimeAt(t.progress, RANGES);
    attitudeAt(beatTime, attitude);
    lightingAt(beatTime, lighting);
    trim.step(Math.min(delta, 1 / 20));
    const { pitch, roll } = effectiveAttitude(attitude);

    if (cradleGroup.current) cradleGroup.current.rotation.x = cradleRotationX(pitch);
    if (caseGroup.current) caseGroup.current.rotation.z = caseRotationZ(roll);
    if (outerGroup.current) outerGroup.current.rotation.z = -caseRotationZ(roll);
    if (innerGroup.current) innerGroup.current.rotation.x = -cradleRotationX(pitch);

    const glow = lighting.post;
    // The practicals sit a hand's width from the bezel: a fraction of the
    // emissive glow is all the enamel needs before bloom blooms.
    if (practicalA.current) practicalA.current.intensity = glow * 0.45;
    if (practicalB.current) practicalB.current.intensity = glow * 0.45;
    const step = Math.round((glow / 1.6) * 20);
    if (step !== glowStep) setGlowStep(step);

    const l = last.current;
    const changed =
      Math.abs(l.pitch - pitch) > 1e-4 || Math.abs(l.roll - roll) > 1e-4 || Math.abs(l.post - glow) > 1e-4;
    l.pitch = pitch;
    l.roll = roll;
    l.post = glow;
    if (changed || !trim.settled) invalidate();
  });

  // Visitor trim, mouse only: a drag tilts the case a few degrees and it
  // springs back on release. On touch the scroll already demonstrates the
  // same thing, and a drag would fight the browser's own scrolling.
  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    const native = event.nativeEvent;
    if (native.pointerType === "touch" || native.button !== 0) return;
    if (useTimeline.getState().reducedMotion) return;
    event.stopPropagation();
    const d = drag.current;
    d.id = event.pointerId;
    d.x = event.clientX;
    d.y = event.clientY;
    // Capture through react-three-fiber's own target, so moves and the
    // release keep reaching this mesh after the pointer leaves the sphere.
    d.target = event.target as unknown as PointerTarget;
    d.target.setPointerCapture?.(event.pointerId);
    trim.active = true;
    document.body.style.cursor = "grabbing";
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (d.id !== event.pointerId || !trim.active) return;
    trim.targetPitch = MathUtils.clamp((event.clientY - d.y) * TRIM_GAIN, -TRIM_LIMIT, TRIM_LIMIT);
    trim.targetRoll = MathUtils.clamp((event.clientX - d.x) * TRIM_GAIN, -TRIM_LIMIT, TRIM_LIMIT);
    invalidate();
  };

  const release = () => {
    const d = drag.current;
    if (d.id === -1 && !trim.active) return;
    if (d.id !== -1) d.target?.releasePointerCapture?.(d.id);
    d.id = -1;
    d.target = null;
    trim.active = false;
    trim.targetPitch = 0;
    trim.targetRoll = 0;
    document.body.style.cursor = "";
    invalidate();
  };

  // Escape lets go of the instrument, and so does any release the mesh did
  // not see (a pointer cancelled by the system, a button let go over the
  // readout): stable event handlers, so the listeners are registered once
  // and still see the latest closure.
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") release();
  });
  const onWindowRelease = useEffectEvent(() => release());
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => onEscape(event);
    const onUp = () => onWindowRelease();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  return (
    <group>
      <Stand />
      <group ref={cradleGroup}>
        <Cradle>
          <group ref={caseGroup}>
            <group ref={bezelGroup}>
              <Bezel glow={glowStep / 20} />
            </group>
            <Cage />
            <pointLight ref={practicalA} color={PALETTE.postColor} intensity={0} distance={1.2} decay={2} position={PRACTICALS[0]} />
            <pointLight ref={practicalB} color={PALETTE.postColor} intensity={0} distance={1.2} decay={2} position={PRACTICALS[1]} />
            <group ref={outerGroup}>
              <OuterRing />
              <Jewels />
              <group ref={innerGroup}>
                <InnerRing />
                <HorizonSphere />
              </group>
            </group>
          </group>
        </Cradle>
      </group>
      {/* Invisible handle for the trim drag: the whole instrument is grabbable. */}
      <mesh
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onPointerOver={(e) => {
          if (e.nativeEvent.pointerType !== "touch" && !useTimeline.getState().reducedMotion) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!trim.active) document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[1.7, 16, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}
