/**
 * GameWorld.jsx — The core 3D game environment.
 *
 * Full-screen Three.js canvas with Rapier physics, containing:
 *   - A ground plane with grid runway texture
 *   - Boundary walls
 *   - Ambient lighting and fog
 *   - Zone markers for each portfolio section
 *   - The player-controlled airplane
 *
 * This replaces the scroll-based layout with a Bruno Simon–style
 * game where the user flies/drives around a 3D world.
 */

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars } from "@react-three/drei";
import { Suspense, memo, lazy, useMemo } from "react";
import * as THREE from "three";
import { useAppStore } from "../store/index.js";
import { getTierConfig } from "../systems/PerformanceManager.js";

// Direct imports — these are already code-split via lazy GameWorld in App.jsx
import Airplane from "./Airplane.jsx";
import Ground from "./Ground.jsx";
import ZoneMarkers from "./ZoneMarkers.jsx";

// PostEffects is genuinely heavy (~160KB) — keep lazy
const PostEffects = lazy(() => import("./HangarPostEffects.jsx"));

// ── Visible ground that renders immediately (no physics dependency) ──
// Ensures the scene isn't black while Rapier WASM loads.
function ImmediateGround() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
    ctx.lineWidth = 1;
    const step = size / 16;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(size, i * step);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        map={texture}
        color="#080810"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

function GameWorld({ isMobile }) {
  const tier = useAppStore((s) => s.performanceTier);
  const config = getTierConfig(tier);

  return (
    <Canvas
      shadows={config.shadows}
      camera={{ position: [0, 12, 20], fov: 55, near: 0.1, far: 500 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      gl={{
        antialias: config.antialias,
        alpha: false,
        powerPreference: "high-performance",
      }}
      dpr={config.dpr}
      style={{ background: "#050505" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow={config.shadows}
        shadow-mapSize-width={config.shadows ? 1024 : 256}
        shadow-mapSize-height={config.shadows ? 1024 : 256}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#6366f1" />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={["#050508", 40, 180]} />

      {/* Stars background */}
      {tier !== "low" && (
        <Stars radius={120} depth={60} count={tier === "high" ? 3000 : 1500} factor={3} saturation={0.2} fade speed={0.5} />
      )}

      {/* Immediate ground — visible while Rapier WASM loads */}
      <ImmediateGround />

      <Physics gravity={[0, -20, 0]} timeStep="vary">
        <Ground />
        <Airplane isMobile={isMobile} />
        <ZoneMarkers />
      </Physics>

      {/* Conditional postprocessing */}
      {config.postprocessing && (
        <Suspense fallback={null}>
          <PostEffects bloomIntensity={config.bloomIntensity * 0.5} />
        </Suspense>
      )}
    </Canvas>
  );
}

export default memo(GameWorld);
