/**
 * Ground.jsx — The game world ground plane.
 *
 * A large ground surface with runway markings and grid.
 * Uses a RigidBody for physics collision.
 */

import { useMemo, memo } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// ─── Grid texture created once at module level ───────────────
function createGridTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, size, size);

  // Grid lines
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

  // Major lines (brighter)
  ctx.strokeStyle = "rgba(99, 102, 241, 0.18)";
  ctx.lineWidth = 2;
  const majorStep = size / 4;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * majorStep, 0);
    ctx.lineTo(i * majorStep, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * majorStep);
    ctx.lineTo(size, i * majorStep);
    ctx.stroke();
  }

  // Center runway stripe
  ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

let _gridTex = null;
function getGridTexture() {
  if (!_gridTex) _gridTex = createGridTexture();
  return _gridTex;
}

// ─── Boundary wall helper ─────────────────────────────────────
function BoundaryWall({ position, args }) {
  return (
    <RigidBody type="fixed" position={position} restitution={0.5}>
      <mesh>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color="#6366f1"
          transparent
          opacity={0.06}
          emissive="#6366f1"
          emissiveIntensity={0.3}
        />
      </mesh>
    </RigidBody>
  );
}

// ─── Ground ───────────────────────────────────────────────────
function Ground() {
  const gridTexture = useMemo(() => getGridTexture(), []);

  const WORLD_SIZE = 120;
  const WALL_HEIGHT = 4;
  const WALL_THICKNESS = 1;
  const HALF = WORLD_SIZE / 2;

  return (
    <group>
      {/* Ground plane */}
      <RigidBody type="fixed" friction={1} restitution={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
          <meshStandardMaterial
            map={gridTexture}
            color="#080810"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* Boundary walls — invisible but with subtle glow */}
      <BoundaryWall position={[0, WALL_HEIGHT / 2, -HALF]} args={[WORLD_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
      <BoundaryWall position={[0, WALL_HEIGHT / 2, HALF]} args={[WORLD_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
      <BoundaryWall position={[-HALF, WALL_HEIGHT / 2, 0]} args={[WALL_THICKNESS, WALL_HEIGHT, WORLD_SIZE]} />
      <BoundaryWall position={[HALF, WALL_HEIGHT / 2, 0]} args={[WALL_THICKNESS, WALL_HEIGHT, WORLD_SIZE]} />

      {/* Runway center line markers */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.01, -HALF + 6 + i * 6]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.4, 3]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* Edge lights along the runway */}
      {Array.from({ length: 30 }).map((_, i) => {
        const z = -HALF + 4 + i * 4;
        return (
          <group key={`edge-${i}`}>
            <mesh position={[-3, 0.15, z]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color={i % 5 === 0 ? "#e879f9" : "#6366f1"} />
            </mesh>
            <mesh position={[3, 0.15, z]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color={i % 5 === 0 ? "#e879f9" : "#6366f1"} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default memo(Ground);
