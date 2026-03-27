import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../store';

// ── Module-level materials (created once) ────────────────────────────────────
const bodyMat = new THREE.MeshStandardMaterial({
  color: '#0a0a1a',
  emissive: '#00ffff',
  emissiveIntensity: 0.3,
  roughness: 0.4,
  metalness: 0.6,
});

const headMat = new THREE.MeshStandardMaterial({
  color: '#1a1a2e',
  emissive: '#aa00ff',
  emissiveIntensity: 0.3,
  roughness: 0.4,
  metalness: 0.5,
});

const visorMat = new THREE.MeshStandardMaterial({
  color: '#00ffff',
  emissive: '#00ffff',
  emissiveIntensity: 1.0,
  roughness: 0.1,
  metalness: 0.8,
});

const limbMat = new THREE.MeshStandardMaterial({
  color: '#0d0d20',
  emissive: '#0033ff',
  emissiveIntensity: 0.2,
  roughness: 0.5,
  metalness: 0.6,
});

// ── Helpers defined outside the component to avoid per-frame allocations ─────
function setRot(ref: React.RefObject<THREE.Object3D | null>, x: number, y: number, z: number) {
  if (ref.current) {
    ref.current.rotation.x = x;
    ref.current.rotation.y = y;
    ref.current.rotation.z = z;
  }
}

function setPos(ref: React.RefObject<THREE.Object3D | null>, x: number, y: number, z: number) {
  if (ref.current) ref.current.position.set(x, y, z);
}

export default function Character() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmUpperRef = useRef<THREE.Mesh>(null);
  const leftArmLowerRef = useRef<THREE.Mesh>(null);
  const rightArmUpperRef = useRef<THREE.Mesh>(null);
  const rightArmLowerRef = useRef<THREE.Mesh>(null);
  const leftLegUpperRef = useRef<THREE.Mesh>(null);
  const leftLegLowerRef = useRef<THREE.Mesh>(null);
  const rightLegUpperRef = useRef<THREE.Mesh>(null);
  const rightLegLowerRef = useRef<THREE.Mesh>(null);
  const leftArmGroupRef = useRef<THREE.Group>(null);
  const rightArmGroupRef = useRef<THREE.Group>(null);
  const leftLegGroupRef = useRef<THREE.Group>(null);
  const rightLegGroupRef = useRef<THREE.Group>(null);

  const playerPos = useGameStore((s) => s.playerPos);
  const playerRot = useGameStore((s) => s.playerRot);
  const animState = useGameStore((s) => s.animState);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!groupRef.current) return;

    // Position/rotation from store
    groupRef.current.position.set(...playerPos);
    groupRef.current.rotation.y = playerRot;

    if (animState === 'idle') {
      // Gentle breathing bob
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.9 + Math.sin(t * 1.5) * 0.03;
      }
      setRot(leftArmGroupRef, 0, 0, 0.15);
      setRot(rightArmGroupRef, 0, 0, -0.15);
      setRot(leftLegGroupRef, 0, 0, 0);
      setRot(rightLegGroupRef, 0, 0, 0);
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;

    } else if (animState === 'walking') {
      // Swing legs and arms
      const swing = Math.sin(t * 6);
      if (bodyRef.current) bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(t * 12)) * 0.02;
      setRot(leftLegGroupRef, swing * 0.5, 0, 0);
      setRot(rightLegGroupRef, -swing * 0.5, 0, 0);
      setRot(leftArmGroupRef, -swing * 0.4, 0, 0.12);
      setRot(rightArmGroupRef, swing * 0.4, 0, -0.12);
      if (headRef.current) headRef.current.rotation.y = 0;

    } else if (animState === 'thinking') {
      // Raise right arm, tilt head
      if (bodyRef.current) bodyRef.current.position.y = 0.9 + Math.sin(t * 0.8) * 0.02;
      setRot(rightArmGroupRef, -0.8, 0, -0.5);
      if (rightArmUpperRef.current) rightArmUpperRef.current.rotation.x = -0.5;
      setRot(leftArmGroupRef, 0, 0, 0.15);
      setRot(leftLegGroupRef, 0, 0, 0);
      setRot(rightLegGroupRef, 0, 0, 0);
      if (headRef.current) {
        headRef.current.rotation.z = -0.1;
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.15;
      }

    } else if (animState === 'sitting_typing') {
      // Seated pose: legs bent 90°, arms forward, hands jitter
      if (bodyRef.current) bodyRef.current.position.y = 0.52;
      setRot(leftLegGroupRef, Math.PI * 0.5, 0, 0.05);
      setRot(rightLegGroupRef, Math.PI * 0.5, 0, -0.05);
      if (leftLegLowerRef.current) leftLegLowerRef.current.rotation.x = -Math.PI * 0.5;
      if (rightLegLowerRef.current) rightLegLowerRef.current.rotation.x = -Math.PI * 0.5;
      // Arms reach forward onto keyboard
      setRot(leftArmGroupRef, -0.6, 0, 0.15);
      setRot(rightArmGroupRef, -0.6, 0, -0.15);
      // Rapid typing jitter
      if (leftArmLowerRef.current) leftArmLowerRef.current.rotation.x = Math.sin(t * 18) * 0.15;
      if (rightArmLowerRef.current) rightArmLowerRef.current.rotation.x = Math.sin(t * 18 + Math.PI) * 0.15;
      if (headRef.current) {
        headRef.current.rotation.x = 0.1;
        headRef.current.rotation.y = 0;
        headRef.current.rotation.z = 0;
      }
    }

    // Lower limb positions always computed
    if (animState !== 'sitting_typing') {
      if (leftLegLowerRef.current) leftLegLowerRef.current.rotation.x = 0;
      if (rightLegLowerRef.current) rightLegLowerRef.current.rotation.x = 0;
      if (leftArmLowerRef.current) leftArmLowerRef.current.rotation.x = 0;
      if (rightArmLowerRef.current) rightArmLowerRef.current.rotation.x = 0;
    }

    // Keep sub-component relative positions reset each frame for non-sitting states
    const BODY_Y_STAND = 0.9;
    const BODY_Y_STAND_MIN = 0.85;
    if (animState !== 'sitting_typing' && bodyRef.current) {
      if (bodyRef.current.position.y < BODY_Y_STAND_MIN) bodyRef.current.position.y = BODY_Y_STAND;
    }

    // Leg lower relative positioning
    setPos(leftLegLowerRef, 0, -0.5, 0);
    setPos(rightLegLowerRef, 0, -0.5, 0);
    setPos(leftArmLowerRef, 0, -0.45, 0);
    setPos(rightArmLowerRef, 0, -0.45, 0);
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.9, 0]} material={bodyMat} castShadow>
        <capsuleGeometry args={[0.25, 0.7, 8, 16]} />
      </mesh>

      {/* Head group */}
      <group ref={headRef} position={[0, 1.65, 0]}>
        <mesh material={headMat} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0, 0.18]} material={visorMat}>
          <boxGeometry args={[0.3, 0.1, 0.05]} />
        </mesh>
      </group>

      {/* Left arm */}
      <group ref={leftArmGroupRef} position={[-0.35, 1.3, 0]}>
        <mesh ref={leftArmUpperRef} position={[0, -0.2, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
        </mesh>
        <mesh ref={leftArmLowerRef} position={[0, -0.67, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
        </mesh>
      </group>

      {/* Right arm */}
      <group ref={rightArmGroupRef} position={[0.35, 1.3, 0]}>
        <mesh ref={rightArmUpperRef} position={[0, -0.2, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
        </mesh>
        <mesh ref={rightArmLowerRef} position={[0, -0.67, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
        </mesh>
      </group>

      {/* Left leg */}
      <group ref={leftLegGroupRef} position={[-0.15, 0.5, 0]}>
        <mesh ref={leftLegUpperRef} position={[0, -0.25, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
        </mesh>
        <mesh ref={leftLegLowerRef} position={[0, -0.5, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        </mesh>
      </group>

      {/* Right leg */}
      <group ref={rightLegGroupRef} position={[0.15, 0.5, 0]}>
        <mesh ref={rightLegUpperRef} position={[0, -0.25, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
        </mesh>
        <mesh ref={rightLegLowerRef} position={[0, -0.5, 0]} material={limbMat} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        </mesh>
      </group>
    </group>
  );
}
