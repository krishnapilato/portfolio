import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useEffectEvent, useRef } from "react";
import { Group, MathUtils, Mesh, MeshStandardMaterial, PointLight } from "three";
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
import OuterRing from "./instrument/OuterRing";
import Stand from "./instrument/Stand";
import { KEYFRAMES } from "./keyframes";
import { PALETTE } from "./palette";

const RANGES = computeRanges(KEYFRAMES);
const attitude: Attitude = { pitch: 0, roll: 0, yaw: 0 };
const lighting: Lighting = { key: 18, rim: 32, post: 0, exposure: 1.05, bokeh: 1.6, warmth: 0 };
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
  const drag = useRef({ id: -1, x: 0, y: 0 });
  const last = useRef({ pitch: NaN, roll: NaN, post: NaN });
  const postMaterials = useRef<MeshStandardMaterial[]>([]);

  // The post lights glow from inside the object in the epilogue; the bezel
  // marks its emissive meshes so the assembly can drive them per frame.
  useEffect(() => {
    const found: MeshStandardMaterial[] = [];
    bezelGroup.current?.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh && mesh.userData.postLight) {
        const material = mesh.material as MeshStandardMaterial;
        if (material.emissive) found.push(material);
      }
    });
    postMaterials.current = found;
  }, []);

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
    for (const material of postMaterials.current) material.emissiveIntensity = (glow / 1.6) * 2.2;
    if (practicalA.current) practicalA.current.intensity = glow;
    if (practicalB.current) practicalB.current.intensity = glow;

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
    trim.active = true;
    (native.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
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
    d.id = -1;
    trim.active = false;
    trim.targetPitch = 0;
    trim.targetRoll = 0;
    document.body.style.cursor = "";
    invalidate();
  };

  // Escape lets go of the instrument: a stable event handler for the effect,
  // so the listener is registered once and still sees the latest closure.
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") release();
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => onEscape(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <group>
      <Stand />
      <group ref={cradleGroup}>
        <Cradle>
          <group ref={caseGroup}>
            <group ref={bezelGroup}>
              <Bezel />
            </group>
            <Cage />
            <pointLight ref={practicalA} color={PALETTE.postColor} intensity={0} distance={1.5} decay={2} position={PRACTICALS[0]} />
            <pointLight ref={practicalB} color={PALETTE.postColor} intensity={0} distance={1.5} decay={2} position={PRACTICALS[1]} />
            <group ref={outerGroup}>
              <OuterRing />
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
