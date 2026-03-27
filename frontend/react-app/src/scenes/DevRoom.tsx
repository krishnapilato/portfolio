import { useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import Floor from './Floor';
import Lighting from './Lighting';
import Desk from './Desk';
import Character from './Character';
import CameraRig from './CameraRig';
import Particles from './Particles';
import PostFX from './PostFX';
import HolographicDisplay from './HolographicDisplay';
import { usePlayerController } from '../systems/usePlayerController';
import useGameStore from '../store';

const ROOM_HALF = 14;
const DESK_POS = new THREE.Vector3(0, 0, -8);
const DESK_RADIUS = 2.5;
const IDLE_TIMEOUT = 5;
const SPEED = 5;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// Wall material: dark with neon emissive trim
const wallMat = new THREE.MeshStandardMaterial({
  color: '#060612',
  emissive: '#000033',
  emissiveIntensity: 0.5,
  roughness: 0.8,
  metalness: 0.3,
});

const neonTrimMat = new THREE.MeshStandardMaterial({
  color: '#00ffff',
  emissive: '#00ffff',
  emissiveIntensity: 1.5,
});

function RoomWalls() {
  return (
    <>
      {/* North wall z=-15 */}
      <mesh position={[0, 2.5, -15]} material={wallMat} receiveShadow>
        <boxGeometry args={[30, 5, 0.2]} />
      </mesh>
      <mesh position={[0, 0, -15]}>
        <boxGeometry args={[30, 0.05, 0.1]} />
        <primitive object={neonTrimMat} attach="material" />
      </mesh>

      {/* South wall z=15 */}
      <mesh position={[0, 2.5, 15]} material={wallMat} receiveShadow>
        <boxGeometry args={[30, 5, 0.2]} />
      </mesh>
      <mesh position={[0, 0, 15]}>
        <boxGeometry args={[30, 0.05, 0.1]} />
        <primitive object={neonTrimMat} attach="material" />
      </mesh>

      {/* West wall x=-15 */}
      <mesh position={[-15, 2.5, 0]} material={wallMat} receiveShadow>
        <boxGeometry args={[0.2, 5, 30]} />
      </mesh>
      <mesh position={[-15, 0, 0]}>
        <boxGeometry args={[0.1, 0.05, 30]} />
        <primitive object={neonTrimMat} attach="material" />
      </mesh>

      {/* East wall x=15 */}
      <mesh position={[15, 2.5, 0]} material={wallMat} receiveShadow>
        <boxGeometry args={[0.2, 5, 30]} />
      </mesh>
      <mesh position={[15, 0, 0]}>
        <boxGeometry args={[0.1, 0.05, 30]} />
        <primitive object={neonTrimMat} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[30, 0.1, 30]} />
        <meshStandardMaterial
          color="#030309"
          emissive="#000022"
          emissiveIntensity={0.3}
        />
      </mesh>
    </>
  );
}

function PhysicsWalls() {
  return (
    <>
      {/* North */}
      <RigidBody type="fixed">
        <CuboidCollider args={[15, 5, 0.1]} position={[0, 2.5, -15]} />
      </RigidBody>
      {/* South */}
      <RigidBody type="fixed">
        <CuboidCollider args={[15, 5, 0.1]} position={[0, 2.5, 15]} />
      </RigidBody>
      {/* West */}
      <RigidBody type="fixed">
        <CuboidCollider args={[0.1, 5, 15]} position={[-15, 2.5, 0]} />
      </RigidBody>
      {/* East */}
      <RigidBody type="fixed">
        <CuboidCollider args={[0.1, 5, 15]} position={[15, 2.5, 0]} />
      </RigidBody>
    </>
  );
}

function SceneLogic() {
  const { getState, lastKeyTimeRef } = usePlayerController();
  const idleTimerRef = useRef(0);

  const setPlayerPos = useGameStore((s) => s.setPlayerPos);
  const setPlayerRot = useGameStore((s) => s.setPlayerRot);
  const setAnimState = useGameStore((s) => s.setAnimState);
  const setAtDesk = useGameStore((s) => s.setAtDesk);

  useFrame((_, delta) => {
    const { velocity, isMoving, direction } = getState();
    const pos = useGameStore.getState().playerPos;
    const atDesk = useGameStore.getState().atDesk;

    // Compute new position
    const speed = isMoving ? SPEED : 0;
    const newX = clamp(pos[0] + velocity[0] * delta * speed, -ROOM_HALF, ROOM_HALF);
    const newZ = clamp(pos[2] + velocity[2] * delta * speed, -ROOM_HALF, ROOM_HALF);

    const newPos: [number, number, number] = [newX, pos[1], newZ];

    // Desk proximity check
    const dx = newX - DESK_POS.x;
    const dz = newZ - DESK_POS.z;
    const distToDesk = Math.sqrt(dx * dx + dz * dz);
    const nearDesk = distToDesk < DESK_RADIUS;

    if (nearDesk !== atDesk) {
      setAtDesk(nearDesk);
    }

    // Animation state
    if (nearDesk) {
      setAnimState('sitting_typing');
      idleTimerRef.current = 0;
    } else if (isMoving) {
      setAnimState('walking');
      idleTimerRef.current = 0;
    } else {
      // Check if key was recently pressed (within IDLE_TIMEOUT)
      const timeSinceKey = (Date.now() - lastKeyTimeRef.current) / 1000;
      if (timeSinceKey < IDLE_TIMEOUT) {
        idleTimerRef.current += delta;
        setAnimState('idle');
      } else {
        idleTimerRef.current += delta;
        if (idleTimerRef.current > IDLE_TIMEOUT) {
          setAnimState('thinking');
        } else {
          setAnimState('idle');
        }
      }
    }

    // Update rotation when moving
    if (isMoving) {
      setPlayerRot(direction);
    }

    setPlayerPos(newPos);
  });

  return null;
}

export default function DevRoom() {
  return (
    <Physics gravity={[0, -9.81, 0]}>
      <SceneLogic />
      <Floor />
      <RoomWalls />
      <PhysicsWalls />
      <Lighting />
      <Desk />
      <Character />
      <CameraRig />
      <Particles />
      <HolographicDisplay />
      <PostFX />
    </Physics>
  );
}
