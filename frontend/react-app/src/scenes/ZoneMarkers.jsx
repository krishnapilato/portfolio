/**
 * ZoneMarkers.jsx — Interactive 3D zone markers in the game world.
 *
 * Each zone is a glowing totem/pillar at a specific position.
 * When the player airplane is close enough, the zone becomes "active"
 * and the HUD overlay shows the corresponding portfolio section.
 *
 * Zones are arranged in a circuit around the world:
 *   - About (north)
 *   - Skills (east)
 *   - Experience (south-east)
 *   - Projects (south-west)
 *   - Contact (west)
 */

import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import { useRef, memo } from "react";
import * as THREE from "three";
import { useAppStore } from "../store/index.js";

// ── Zone definitions ──────────────────────────────────────
const ZONES = [
  { id: "about",      label: "ABOUT",      color: "#6366f1", position: [0,  0, -35], chapter: "02" },
  { id: "skills",     label: "SKILLS",     color: "#a78bfa", position: [35, 0,  0],  chapter: "03" },
  { id: "experience", label: "EXPERIENCE", color: "#06b6d4", position: [25, 0,  30], chapter: "04" },
  { id: "projects",   label: "PROJECTS",   color: "#e879f9", position: [-25, 0, 30], chapter: "05" },
  { id: "contact",    label: "CONTACT",    color: "#10b981", position: [-35, 0, 0],  chapter: "06" },
];

const ACTIVATION_DISTANCE = 10;

// ── Floating ring animation ───────────────────────────────
function FloatingRing({ color, radius = 2.2, speed = 1 }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed * 0.5;
      ref.current.rotation.x = Math.sin(Date.now() * 0.001 * speed) * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={[0, 3, 0]}>
      <torusGeometry args={[radius, 0.04, 8, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
}

// ── Single zone marker ────────────────────────────────────
function ZoneMarker({ zone, isActive }) {
  const pillarRef = useRef();
  const glowRef = useRef();

  useFrame((_, delta) => {
    // Pulse glow when active
    if (glowRef.current) {
      const targetScale = isActive ? 1.3 : 1.0;
      const targetOpacity = isActive ? 0.6 : 0.2;
      const s = glowRef.current.scale;
      s.x = THREE.MathUtils.lerp(s.x, targetScale, delta * 4);
      s.y = THREE.MathUtils.lerp(s.y, targetScale, delta * 4);
      s.z = THREE.MathUtils.lerp(s.z, targetScale, delta * 4);
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity,
        targetOpacity,
        delta * 4,
      );
    }
    // Bob the pillar slightly
    if (pillarRef.current) {
      pillarRef.current.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.15;
    }
  });

  return (
    <group position={zone.position}>
      {/* Physics collider (invisible) */}
      <RigidBody type="fixed">
        <mesh visible={false}>
          <cylinderGeometry args={[1.5, 1.5, 0.5, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Base glow disc on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshBasicMaterial color={zone.color} transparent opacity={0.08} />
      </mesh>

      {/* Pillar */}
      <group ref={pillarRef} position={[0, 1.5, 0]}>
        {/* Core */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 3, 0.5]} />
          <meshStandardMaterial
            color={zone.color}
            emissive={zone.color}
            emissiveIntensity={isActive ? 0.8 : 0.3}
            roughness={0.2}
            metalness={0.7}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Top cap */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.8, 0.15, 0.8]} />
          <meshStandardMaterial
            color={zone.color}
            emissive={zone.color}
            emissiveIntensity={isActive ? 1.0 : 0.4}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Glow sphere */}
      <mesh ref={glowRef} position={[0, 4, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color={zone.color} transparent opacity={0.2} />
      </mesh>

      {/* Floating rings */}
      <FloatingRing color={zone.color} radius={1.8} speed={0.8} />
      <FloatingRing color={zone.color} radius={2.5} speed={-0.5} />

      {/* Zone label */}
      <Text
        position={[0, 5.5, 0]}
        fontSize={0.5}
        color={zone.color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
        letterSpacing={0.2}
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {zone.label}
      </Text>

      {/* Chapter number */}
      <Text
        position={[0, 4.8, 0]}
        fontSize={0.25}
        color="rgba(255,255,255,0.3)"
        anchorX="center"
        anchorY="middle"
        font={undefined}
        letterSpacing={0.3}
      >
        {`CHAPTER ${zone.chapter}`}
      </Text>

      {/* Interaction hint when active */}
      {isActive && (
        <Text
          position={[0, 6.2, 0]}
          fontSize={0.2}
          color="rgba(255,255,255,0.5)"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.15}
        >
          {"PRESS E / TAP TO OPEN"}
        </Text>
      )}
    </group>
  );
}

// ── Zone detection system ─────────────────────────────────
function ZoneDetector() {
  const setActiveZone = useAppStore((s) => s.setActiveZone);
  const discoverSection = useAppStore((s) => s.discoverSection);

  useFrame(() => {
    const { playerX, playerZ } = useAppStore.getState();
    if (playerX === undefined) return;

    let nearest = null;
    let nearestDist = Infinity;

    for (const zone of ZONES) {
      const dx = playerX - zone.position[0];
      const dz = playerZ - zone.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < ACTIVATION_DISTANCE && dist < nearestDist) {
        nearest = zone;
        nearestDist = dist;
      }
    }

    const currentZone = useAppStore.getState().activeZone;
    const newZone = nearest ? nearest.id : null;

    if (newZone !== currentZone) {
      setActiveZone(newZone);
      if (nearest) {
        // Map zone id to section index for discovery tracking
        const idx = ZONES.findIndex((z) => z.id === nearest.id);
        if (idx >= 0) discoverSection(idx + 2); // offset by 2 (0=entry, 1=hero)
      }
    }
  });

  return null;
}

// ── Main export ───────────────────────────────────────────
function ZoneMarkers() {
  const activeZone = useAppStore((s) => s.activeZone);

  return (
    <group>
      <ZoneDetector />
      {ZONES.map((zone) => (
        <ZoneMarker
          key={zone.id}
          zone={zone}
          isActive={activeZone === zone.id}
        />
      ))}

      {/* Spawn point marker (center) */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.5, 2, 32]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.15} />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.3}
          color="rgba(99,102,241,0.4)"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          letterSpacing={0.25}
        >
          START
        </Text>
      </group>
    </group>
  );
}

export { ZONES };
export default memo(ZoneMarkers);
