/**
 * HangarScene — aviation-themed persistent 3D background.
 *
 * Renders a dark hangar environment with:
 *   - Structural beams forming the hangar silhouette
 *   - Runway guide lights receding into depth
 *   - Ambient particle field (dust / atmospheric haze)
 *   - Camera advances through the hangar as the user scrolls
 *
 * Performance decisions:
 *   - All geometry is low-poly and uses meshBasicMaterial (no lighting calc)
 *   - Particles use instanced buffer geometry
 *   - Bloom is conditionally applied based on tier
 *   - Lazy-loads postprocessing only when needed
 *   - Reuses materials across meshes via shared refs
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useMemo, memo, lazy } from "react";
import * as THREE from "three";
import { useAppStore } from "../store/index.js";
import { getTierConfig } from "../systems/PerformanceManager.js";

// Lazy-load postprocessing to avoid blocking initial paint
const PostEffects = lazy(() => import("./HangarPostEffects.jsx"));

// ─── Constants ────────────────────────────────────────────────
const HANGAR_DEPTH = 160;
const BEAM_COUNT = 28;

// ─── Shared materials (reused, never re-created) ─────────────
const beamMaterial = new THREE.MeshBasicMaterial({
  color: "#6366f1",
  transparent: true,
  opacity: 0.04,
  depthWrite: false,
});

const beamAccentMaterial = new THREE.MeshBasicMaterial({
  color: "#a78bfa",
  transparent: true,
  opacity: 0.1,
  depthWrite: false,
});

const lightMaterial = new THREE.MeshBasicMaterial({
  color: "#6366f1",
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
});

const lightAccentMaterial = new THREE.MeshBasicMaterial({
  color: "#e879f9",
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});

// ─── Hangar structural beams ──────────────────────────────────
function HangarBeams() {
  const beams = useMemo(() =>
    Array.from({ length: BEAM_COUNT }, (_, i) => {
      const isAccent = i % 6 === 0;
      const z = -(i * (HANGAR_DEPTH / BEAM_COUNT));
      return { key: i, z, isAccent };
    }),
  []);

  // Shared geometry for all beams
  const archGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 6, h = 4;
    shape.moveTo(-w, -h);
    shape.lineTo(-w, h * 0.6);
    shape.quadraticCurveTo(-w, h, -w * 0.5, h);
    shape.lineTo(w * 0.5, h);
    shape.quadraticCurveTo(w, h, w, h * 0.6);
    shape.lineTo(w, -h);

    const hole = new THREE.Path();
    const iw = w - 0.08, ih = h - 0.08;
    hole.moveTo(-iw, -ih);
    hole.lineTo(-iw, ih * 0.6);
    hole.quadraticCurveTo(-iw, ih, -iw * 0.5, ih);
    hole.lineTo(iw * 0.5, ih);
    hole.quadraticCurveTo(iw, ih, iw, ih * 0.6);
    hole.lineTo(iw, -ih);
    shape.holes.push(hole);

    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group>
      {beams.map((b) => (
        <mesh
          key={b.key}
          geometry={archGeo}
          material={b.isAccent ? beamAccentMaterial : beamMaterial}
          position={[0, 0, b.z]}
        />
      ))}
    </group>
  );
}

// ─── Runway guide lights ──────────────────────────────────────
function RunwayLights() {
  const lights = useMemo(() => {
    const arr = [];
    const spacing = HANGAR_DEPTH / 40;
    for (let i = 0; i < 40; i++) {
      const z = -(i * spacing);
      const isAccent = i % 5 === 0;
      arr.push({ key: `l${i}`, x: -4.5, z, isAccent });
      arr.push({ key: `r${i}`, x: 4.5, z, isAccent });
    }
    return arr;
  }, []);

  const geo = useMemo(() => new THREE.SphereGeometry(0.04, 6, 6), []);

  return (
    <group position={[0, -3.8, 0]}>
      {lights.map((l) => (
        <mesh
          key={l.key}
          geometry={geo}
          material={l.isAccent ? lightAccentMaterial : lightMaterial}
          position={[l.x, 0, l.z]}
        />
      ))}
    </group>
  );
}

// ─── Atmospheric particles ────────────────────────────────────
// Pre-generate particle positions outside the component to avoid
// impure Math.random calls during render.
function createParticlePositions(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1 + Math.random() * 5;
    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    pos[i * 3 + 2] = -(Math.random() * HANGAR_DEPTH);
  }
  return pos;
}

const PARTICLE_POSITIONS_2000 = createParticlePositions(2000);
const PARTICLE_POSITIONS_1000 = createParticlePositions(1000);
const PARTICLE_POSITIONS_600 = createParticlePositions(600);
const PARTICLE_POSITIONS_400 = createParticlePositions(400);

function getParticlePositions(count) {
  if (count >= 2000) return { positions: PARTICLE_POSITIONS_2000, length: 2000 };
  if (count >= 1000) return { positions: PARTICLE_POSITIONS_1000, length: 1000 };
  if (count >= 600) return { positions: PARTICLE_POSITIONS_600, length: 600 };
  return { positions: PARTICLE_POSITIONS_400, length: 400 };
}

function HangarParticles({ count }) {
  const ref = useRef();
  const { positions, length } = useMemo(() => getParticlePositions(count), [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#6366f1"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Camera driver ────────────────────────────────────────────
function HangarCamera({ scrollProgressRef }) {
  const tRef = useRef(0);

  useFrame((state, delta) => {
    tRef.current += delta;
    const t = tRef.current;
    const progress = scrollProgressRef.current;

    // Advance through hangar based on scroll
    const targetZ = 5 - progress * (HANGAR_DEPTH - 25);
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      delta * 1.6,
    );

    // Gentle drift for liveness
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      Math.sin(t * 0.06) * 0.3,
      delta * 0.5,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      Math.cos(t * 0.04) * 0.2,
      delta * 0.5,
    );

    state.camera.lookAt(0, 0, state.camera.position.z - 14);
  });

  return null;
}

// ─── Exported Scene ───────────────────────────────────────────
function HangarScene({ scrollProgressRef, isMobile }) {
  const tier = useAppStore((s) => s.performanceTier);
  const config = getTierConfig(tier);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 68 }}
      gl={{
        antialias: config.antialias,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={config.dpr}
    >
      <HangarCamera scrollProgressRef={scrollProgressRef} />
      <Suspense fallback={null}>
        <HangarBeams />
        <RunwayLights />
        <HangarParticles count={isMobile ? Math.min(config.particleCount, 600) : config.particleCount} />
      </Suspense>

      {/* Conditional postprocessing based on tier */}
      {config.postprocessing && (
        <Suspense fallback={null}>
          <PostEffects bloomIntensity={config.bloomIntensity} />
        </Suspense>
      )}
    </Canvas>
  );
}

export default memo(HangarScene);
