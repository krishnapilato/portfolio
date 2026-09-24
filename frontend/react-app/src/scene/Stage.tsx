import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Object3D, RectAreaLight, SpotLight } from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { computeRanges } from "../lib/beats";
import { useTimeline, type Tier } from "../lib/store";
import { getMaps } from "../textures/library";
import { beatTimeAt, lightingAt, type Lighting } from "./attitude";
import Dust from "./Dust";
import { KEYFRAMES } from "./keyframes";
import { PALETTE, cameraState } from "./palette";

RectAreaLightUniformsLib.init();

const lighting: Lighting = { key: 18, rim: 32, post: 0, exposure: 1.05, bokeh: 1.6, warmth: 0, raker: 0 };
const RANGES = computeRanges(KEYFRAMES);
const KEY_STUDIO = new Color(PALETTE.keyColor);
const KEY_LOW_SUN = new Color("#ffc98a");
const keyColor = new Color();
const FLOOR_Y = -2.3;

/**
 * Lights that follow the film. One logical key (a spot for the shadow and an
 * area light for the long softbox highlight) reveals the instrument in the
 * first two beats; the cool rim leads the aviation orbit, where the key
 * warms to a low sun; the post lights inside the object take over in the
 * epilogue. Everything comes from the lighting track, so scrolling back
 * puts the lights out again in reverse, which reads as dawn.
 */
function Lights({ tier, quality }: { tier: Tier; quality: Tier }) {
  const keySpot = useRef<SpotLight>(null);
  const keyArea = useRef<RectAreaLight>(null);
  const rim = useRef<SpotLight>(null);
  const raker = useRef<SpotLight>(null);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const exposure = useRef(1.05);
  const shadow = quality === "high" ? 1024 : quality === "mid" ? 512 : 0;
  // Spot targets must live in the scene graph, or their world matrices
  // never update and every spot aims at the origin.
  const targets = useMemo(() => ({ key: new Object3D(), rim: new Object3D(), raker: new Object3D() }), []);

  useFrame(() => {
    const t = useTimeline.getState();
    lightingAt(beatTimeAt(t.progress, RANGES), lighting);
    keyColor.copy(KEY_STUDIO).lerp(KEY_LOW_SUN, lighting.warmth);
    if (keySpot.current) {
      keySpot.current.intensity = lighting.key * (tier === "low" ? 1.25 : 1);
      keySpot.current.color.copy(keyColor);
    }
    if (keyArea.current) {
      keyArea.current.intensity = lighting.key * (12 / 18);
      keyArea.current.color.copy(keyColor);
    }
    if (rim.current) rim.current.intensity = lighting.rim;
    // Intensity only, never `visible`: a light that leaves the scene
    // changes every program's light count, and recompiling fifteen shaders
    // mid-scroll is a hitch on every driver and a long one on Windows.
    if (raker.current) raker.current.intensity = lighting.raker;
    cameraState.bokeh = lighting.bokeh;
    if (Math.abs(exposure.current - lighting.exposure) > 1e-3) {
      exposure.current = lighting.exposure;
      gl.toneMappingExposure = lighting.exposure;
      invalidate();
    }
  });

  return (
    <>
      <primitive object={targets.key} position={[0, 0, 0.2]} />
      <primitive object={targets.rim} position={[0, 0, 0.2]} />
      <primitive object={targets.raker} position={[0.3, -0.05, 0.9]} />
      <spotLight
        ref={keySpot}
        target={targets.key}
        color={PALETTE.keyColor}
        intensity={18}
        position={[2.8, 2.6, 1.4]}
        angle={0.42}
        penumbra={0.6}
        decay={2}
        castShadow={shadow > 0}
        shadow-mapSize={[shadow || 1, shadow || 1]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
      />
      {quality !== "low" ? (
        <rectAreaLight
          ref={keyArea}
          args={[PALETTE.keyColor, 12, 1.2, 0.8]}
          position={[2.8, 2.6, 1.4]}
          onUpdate={(l) => l.lookAt(0, 0, 0.2)}
        />
      ) : null}
      <spotLight
        ref={rim}
        target={targets.rim}
        color={PALETTE.rimColor}
        intensity={40}
        position={[-3.0, 1.8, -2.6]}
        angle={0.35}
        penumbra={0.6}
        decay={2}
      />
      {/* The cold open's raker: a small hard light skimming the horizon band
          from the front-left, so the paint edge and the engraving catch a
          clean cool line before any key exists. */}
      <spotLight
        ref={raker}
        target={targets.raker}
        color={PALETTE.rimColor}
        intensity={8}
        position={[-1.7, 0.35, 1.6]}
        angle={0.45}
        penumbra={0.5}
        decay={2}
        distance={4}
      />
      <hemisphereLight args={[PALETTE.fillSky, PALETTE.background, 0.35]} />
    </>
  );
}

/** The bench surface: reflective at the high level, matte elsewhere, always fading to black. */
function Floor({ tier, quality }: { tier: Tier; quality: Tier }) {
  const maps = getMaps(tier);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            color={PALETTE.surface}
            roughnessMap={maps["bench.rough"]}
            roughness={1}
            metalness={0.1}
            mirror={0}
            resolution={512}
            blur={[300, 100]}
            mixBlur={1}
            mixStrength={0.6}
            depthScale={1}
            minDepthThreshold={0.85}
            maxDepthThreshold={1.2}
          />
        ) : (
          <meshStandardMaterial
            color={PALETTE.surface}
            roughnessMap={maps["bench.rough"]}
            roughness={1}
            metalness={0.1}
            envMapIntensity={0.4}
          />
        )}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.005, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshBasicMaterial color={PALETTE.background} transparent alphaMap={maps["bench.alpha"]} depthWrite={false} />
      </mesh>
    </>
  );
}

/**
 * Everything around the instrument: a dark workshop volume with a bench
 * floor, fog that hides the world's edge, dust for the rim light to reveal,
 * four rectangles of light for the metal to reflect, and the lights.
 * No sky, no stars, no room.
 */
export default function Stage() {
  const tier = useTimeline((s) => s.tier);
  const quality = useTimeline((s) => s.quality);
  // Few motes, never additive: air with a light in it, not particles.
  const dustCount = quality === "high" ? 600 : quality === "mid" ? 250 : 0;
  return (
    <>
      <color attach="background" args={[PALETTE.background]} />
      <fogExp2 attach="fog" args={[PALETTE.background, 0.075]} />
      <Environment resolution={256} frames={1} environmentIntensity={1}>
        {/* A dim workshop level between the panels: metal flats reflect this
            instead of black, so the aluminium reads as machined silver. */}
        <color attach="background" args={["#2c3137"]} />
        <Lightformer form="rect" intensity={3} color={PALETTE.keyColor} scale={[3, 1, 1]} position={[3.0, 3.2, 1.8]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color={PALETTE.rimColor} scale={[0.3, 3, 1]} position={[-3.4, 2.0, -3.0]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#202328" scale={[6, 0.5, 1]} position={[0, -2.6, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="ring" intensity={0.4} color="#14181e" scale={6} position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      </Environment>
      <Lights tier={tier} quality={quality} />
      <Floor tier={tier} quality={quality} />
      {quality !== "low" ? (
        <ContactShadows position={[0, FLOOR_Y + 0.01, -1.9]} opacity={0.55} blur={2.4} scale={3} far={1.2} frames={1} resolution={512} />
      ) : null}
      {dustCount > 0 ? (
        <Dust count={dustCount} extent={[3.5, 2.5, 3.5]} center={[0, 0, -0.3]} color={PALETTE.rimColor} size={2.6} opacity={0.2} />
      ) : null}
    </>
  );
}
