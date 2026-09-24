import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, RectAreaLight, SpotLight } from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { computeRanges } from "../lib/beats";
import { useTimeline, type Tier } from "../lib/store";
import { makeCanvas, makeFbm, toTexture } from "../textures/canvas";
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

/** The bench: a matte surface whose roughness varies so any reflection breaks up. */
function useBenchMaps(tier: Tier) {
  return useMemo(() => {
    const size = tier === "low" ? 512 : 1024;
    const fbm = makeFbm(41, 4, 3);
    const [rough, rctx] = makeCanvas(size);
    const img = rctx.createImageData(size, size);
    const cx = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = fbm(x / size, y / size);
        // Faint concentric turning marks about the centre.
        const r = Math.hypot(x - cx, y - cx);
        const rings = 0.012 * Math.sin(r * 0.9);
        const v = Math.round(Math.min(1, Math.max(0, 0.62 + n * 0.18 + rings)) * 255);
        const i = (y * size + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    rctx.putImageData(img, 0, 0);

    // The floor's own vignette: the edge of the disc must never be seen.
    const [alpha, actx] = makeCanvas(512, "#000");
    const gradient = actx.createRadialGradient(256, 256, 256 * 0.35, 256, 256, 256);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(255,255,255,1)");
    actx.fillStyle = gradient;
    actx.fillRect(0, 0, 512, 512);
    return { roughnessMap: toTexture(rough, { repeat: 4, anisotropy: 4 }), alphaMap: toTexture(alpha) };
  }, [tier]);
}

/**
 * Lights that follow the film. One logical key (a spot for the shadow and an
 * area light for the long softbox highlight) reveals the instrument in the
 * first two beats; the cool rim leads the aviation orbit, where the key
 * warms to a low sun; the post lights inside the object take over in the
 * epilogue. Everything comes from the lighting track, so scrolling back
 * puts the lights out again in reverse, which reads as dawn.
 */
function Lights({ tier }: { tier: Tier }) {
  const keySpot = useRef<SpotLight>(null);
  const keyArea = useRef<RectAreaLight>(null);
  const rim = useRef<SpotLight>(null);
  const raker = useRef<SpotLight>(null);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const exposure = useRef(1.05);
  const shadow = tier === "high" ? 1024 : tier === "mid" ? 512 : 0;

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
    if (raker.current) {
      raker.current.intensity = lighting.raker;
      raker.current.visible = lighting.raker > 0.01;
    }
    cameraState.bokeh = lighting.bokeh;
    if (Math.abs(exposure.current - lighting.exposure) > 1e-3) {
      exposure.current = lighting.exposure;
      gl.toneMappingExposure = lighting.exposure;
      invalidate();
    }
  });

  useEffect(() => {
    keySpot.current?.target.position.set(0, 0, 0.2);
    rim.current?.target.position.set(0, 0, 0.2);
    raker.current?.target.position.set(0.3, -0.05, 0.9);
  }, []);

  return (
    <>
      <spotLight
        ref={keySpot}
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
      {tier !== "low" ? (
        <rectAreaLight
          ref={keyArea}
          args={[PALETTE.keyColor, 12, 1.2, 0.8]}
          position={[2.8, 2.6, 1.4]}
          onUpdate={(l) => l.lookAt(0, 0, 0.2)}
        />
      ) : null}
      <spotLight
        ref={rim}
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

/** The bench surface: reflective on the high tier, matte elsewhere, always fading to black. */
function Floor({ tier }: { tier: Tier }) {
  const maps = useBenchMaps(tier);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            color={PALETTE.surface}
            roughnessMap={maps.roughnessMap}
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
            roughnessMap={maps.roughnessMap}
            roughness={1}
            metalness={0.1}
            envMapIntensity={0.4}
          />
        )}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.005, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshBasicMaterial color={PALETTE.background} transparent alphaMap={maps.alphaMap} depthWrite={false} />
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
  const dustCount = tier === "high" ? 1800 : tier === "mid" ? 800 : 300;
  return (
    <>
      <color attach="background" args={[PALETTE.background]} />
      <fogExp2 attach="fog" args={[PALETTE.background, 0.075]} />
      <Environment resolution={256} frames={1} environmentIntensity={1}>
        <Lightformer form="rect" intensity={3} color={PALETTE.keyColor} scale={[3, 1, 1]} position={[3.0, 3.2, 1.8]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.8} color={PALETTE.rimColor} scale={[0.3, 3, 1]} position={[-3.4, 2.0, -3.0]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#202328" scale={[6, 0.5, 1]} position={[0, -2.6, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="ring" intensity={0.4} color="#14181e" scale={6} position={[0, 6, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      </Environment>
      <Lights tier={tier} />
      <Floor tier={tier} />
      {tier !== "low" ? (
        <ContactShadows position={[0, FLOOR_Y + 0.01, -1.9]} opacity={0.55} blur={2.4} scale={3} far={1.2} frames={1} resolution={512} />
      ) : null}
      <Dust count={dustCount} extent={[3.5, 2.5, 3.5]} center={[0, 0, -0.3]} color={PALETTE.rimColor} size={2.6} opacity={0.32} />
    </>
  );
}
