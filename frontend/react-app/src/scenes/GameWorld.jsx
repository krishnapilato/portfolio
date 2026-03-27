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
import { Environment, Stars } from "@react-three/drei";
import { Suspense, memo, lazy } from "react";
import { useAppStore } from "../store/index.js";
import { getTierConfig } from "../systems/PerformanceManager.js";

const Airplane = lazy(() => import("./Airplane.jsx"));
const Ground = lazy(() => import("./Ground.jsx"));
const ZoneMarkers = lazy(() => import("./ZoneMarkers.jsx"));
const PostEffects = lazy(() => import("./HangarPostEffects.jsx"));

function GameWorld({ isMobile }) {
  const tier = useAppStore((s) => s.performanceTier);
  const config = getTierConfig(tier);

  return (
    <Canvas
      shadows={config.shadows}
      camera={{ position: [0, 12, 20], fov: 55, near: 0.1, far: 500 }}
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

      <Physics gravity={[0, -20, 0]} timeStep="vary">
        <Suspense fallback={null}>
          <Ground />
          <Airplane isMobile={isMobile} />
          <ZoneMarkers />
        </Suspense>
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
