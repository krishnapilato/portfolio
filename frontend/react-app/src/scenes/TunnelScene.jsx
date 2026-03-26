/**
 * TunnelScene — persistent, full-viewport 3D background tunnel.
 *
 * Renders a dark space-tunnel of glowing rings + particle clouds.
 * The camera glides forward automatically and also advances along the
 * tunnel as the user scrolls, creating the "flying through" effect.
 *
 * Rendered as a fixed canvas sitting behind all page content (z-0).
 */

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

// ─── Constants ───────────────────────────────────────────────────────────────

const TUNNEL_LENGTH  = 140;   // total depth of the tunnel in world units
const RING_COUNT     = 42;    // number of glowing ring cross-sections
const PARTICLE_COUNT = 2000;  // floating ambient particles

// ─── Ring cross-sections ─────────────────────────────────────────────────────

function TunnelRings() {
  const rings = useMemo(() =>
    Array.from({ length: RING_COUNT }, (_, i) => {
      const t = i / RING_COUNT;
      // Alternating ring sizes and accent colour to add depth variety
      const radius = 3.8 + Math.sin(i * 0.9) * 1.1;
      const isAccent = i % 7 === 0;
      return {
        key: i,
        z: -(i * (TUNNEL_LENGTH / RING_COUNT)) + 5,
        radius,
        opacity: isAccent ? 0.12 : 0.035 + t * 0.02,
        color:   isAccent ? "#8b5cf6" : "#6366f1",
        tube:    isAccent ? 0.012 : 0.006,
      };
    }),
  []);

  return (
    <group>
      {rings.map((r) => (
        <mesh key={r.key} position={[0, 0, r.z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r.radius, r.tube, 8, 96]} />
          <meshBasicMaterial color={r.color} transparent opacity={r.opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Ambient particle cloud ───────────────────────────────────────────────────

function TunnelParticles() {
  const ref  = useRef();
  const ref2 = useRef();

  const { positions, positions2 } = useMemo(() => {
    const pos  = new Float32Array(PARTICLE_COUNT * 3);
    const pos2 = new Float32Array((PARTICLE_COUNT / 2) * 3);

    // Main stream — distributed in a cylinder around the tunnel axis
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 5;
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -(Math.random() * TUNNEL_LENGTH);
    }

    // Secondary stream — tighter, brighter particles near the axis
    for (let i = 0; i < PARTICLE_COUNT / 2; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 1.8;
      pos2[i * 3]     = Math.cos(angle) * radius;
      pos2[i * 3 + 1] = Math.sin(angle) * radius;
      pos2[i * 3 + 2] = -(Math.random() * TUNNEL_LENGTH);
    }

    return { positions: pos, positions2: pos2 };
  }, []);

  useFrame((_, delta) => {
    if (ref.current)  ref.current.rotation.z  += delta * 0.012;
    if (ref2.current) ref2.current.rotation.z -= delta * 0.022;
  });

  return (
    <>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#6366f1" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
      </points>

      <points ref={ref2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT / 2} array={positions2} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#a78bfa" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
      </points>
    </>
  );
}

// ─── Camera driver ────────────────────────────────────────────────────────────

function TunnelCamera({ scrollProgressRef }) {
  const tRef = useRef(0);

  useFrame((state, delta) => {
    tRef.current += delta;
    const t        = tRef.current;
    const progress = scrollProgressRef.current;

    // Target camera Z moves deeper into the tunnel as page scrolls
    const targetZ = 5 - progress * (TUNNEL_LENGTH - 20);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 1.8);

    // Gentle sinusoidal drift so the view feels alive even when not scrolling
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      Math.sin(t * 0.07) * 0.4,
      delta * 0.6,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      Math.cos(t * 0.05) * 0.25,
      delta * 0.6,
    );

    // Always look ahead down the tunnel axis
    state.camera.lookAt(0, 0, state.camera.position.z - 12);
  });

  return null;
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export default function TunnelScene({ scrollProgressRef, isMobile }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 72 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, isMobile ? 1 : 1.5]}
    >
      <TunnelCamera scrollProgressRef={scrollProgressRef} />
      <Suspense fallback={null}>
        <TunnelParticles />
        <TunnelRings />
      </Suspense>

      {/* Subtle bloom gives the indigo rings a neon glow */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.05} intensity={0.6} levels={5} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
