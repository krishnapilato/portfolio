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

// ── Shared materials ─────────────────────────────────────────────────────────
const wallMat = new THREE.MeshStandardMaterial({
  color: '#04040e',
  emissive: '#00001a',
  emissiveIntensity: 0.4,
  roughness: 0.85,
  metalness: 0.2,
});

const makeTrimMat = (color: string) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.6,
    roughness: 0.1,
    metalness: 0.8,
  });

const trimCyan   = makeTrimMat('#00ffff');
const trimPurple = makeTrimMat('#9900ff');
const trimBlue   = makeTrimMat('#0066ff');

// ── Room walls with multi-height neon trim ────────────────────────────────────
function RoomWalls() {
  const TRIM_HEIGHTS = [0.01, 2.0, 4.85] as const;
  const TRIM_COLORS  = [trimCyan, trimPurple, trimBlue] as const;

  return (
    <>
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} receiveShadow>
        <boxGeometry args={[30, 0.12, 30]} />
        <meshStandardMaterial color="#020208" emissive="#00001a" emissiveIntensity={0.25} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Ceiling centre glow panel */}
      <mesh position={[0, 4.94, -8]}>
        <boxGeometry args={[6, 0.04, 3]} />
        <meshStandardMaterial color="#001133" emissive="#00aaff" emissiveIntensity={0.6} roughness={0.1} />
      </mesh>

      {/* North wall  z=-15 */}
      <mesh position={[0, 2.5, -15]} material={wallMat} receiveShadow>
        <boxGeometry args={[30, 5, 0.2]} />
      </mesh>
      {TRIM_HEIGHTS.map((y, i) => (
        <mesh key={`n${i}`} position={[0, y, -14.9]}>
          <boxGeometry args={[30, 0.04, 0.06]} />
          <primitive object={TRIM_COLORS[i]} attach="material" />
        </mesh>
      ))}

      {/* South wall  z=15 */}
      <mesh position={[0, 2.5, 15]} material={wallMat} receiveShadow>
        <boxGeometry args={[30, 5, 0.2]} />
      </mesh>
      {TRIM_HEIGHTS.map((y, i) => (
        <mesh key={`s${i}`} position={[0, y, 14.9]}>
          <boxGeometry args={[30, 0.04, 0.06]} />
          <primitive object={TRIM_COLORS[i]} attach="material" />
        </mesh>
      ))}

      {/* West wall  x=-15 */}
      <mesh position={[-15, 2.5, 0]} material={wallMat} receiveShadow>
        <boxGeometry args={[0.2, 5, 30]} />
      </mesh>
      {TRIM_HEIGHTS.map((y, i) => (
        <mesh key={`w${i}`} position={[-14.9, y, 0]}>
          <boxGeometry args={[0.06, 0.04, 30]} />
          <primitive object={TRIM_COLORS[i]} attach="material" />
        </mesh>
      ))}

      {/* East wall  x=15 */}
      <mesh position={[15, 2.5, 0]} material={wallMat} receiveShadow>
        <boxGeometry args={[0.2, 5, 30]} />
      </mesh>
      {TRIM_HEIGHTS.map((y, i) => (
        <mesh key={`e${i}`} position={[14.9, y, 0]}>
          <boxGeometry args={[0.06, 0.04, 30]} />
          <primitive object={TRIM_COLORS[i]} attach="material" />
        </mesh>
      ))}

      {/* Vertical corner struts */}
      {([[-14.9,-14.9],[14.9,-14.9],[-14.9,14.9],[14.9,14.9]] as [number,number][]).map(([cx,cz],i) => (
        <mesh key={`corner${i}`} position={[cx, 2.5, cz]}>
          <boxGeometry args={[0.08, 5, 0.08]} />
          <primitive object={i % 2 === 0 ? trimCyan : trimPurple} attach="material" />
        </mesh>
      ))}
    </>
  );
}

// ── Server racks on east wall ─────────────────────────────────────────────────
const rackBodyMat = new THREE.MeshStandardMaterial({
  color: '#050510',
  roughness: 0.4,
  metalness: 0.85,
  emissive: '#000011',
  emissiveIntensity: 0.3,
});
const rackLedColors = ['#00ffff', '#ff00cc', '#00ff88', '#ff8800', '#aa00ff'];

function ServerRacks() {
  return (
    <group position={[13.6, 0, 0]}>
      {([-8, -4, 0, 4, 8] as number[]).map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          {/* Rack cabinet */}
          <mesh position={[-0.35, 1.3, 0]} material={rackBodyMat} castShadow>
            <boxGeometry args={[0.55, 2.6, 0.75]} />
          </mesh>
          {/* LED strip */}
          <mesh position={[-0.06, 1.3, 0.38]}>
            <boxGeometry args={[0.03, 2.4, 0.015]} />
            <meshStandardMaterial
              color={rackLedColors[i % rackLedColors.length]}
              emissive={rackLedColors[i % rackLedColors.length]}
              emissiveIntensity={2.5}
            />
          </mesh>
          {/* Rack slots (decorative) */}
          {([0.8, 0.4, 0, -0.4, -0.8] as number[]).map((ry, j) => (
            <mesh key={j} position={[-0.06, 1.3 + ry, 0.375]}>
              <boxGeometry args={[0.44, 0.08, 0.01]} />
              <meshStandardMaterial
                color="#001122"
                emissive="#003344"
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── Data-visualisation bars on west wall ──────────────────────────────────────
function DataVizBars() {
  const heights = [1.8, 2.8, 1.4, 3.2, 2.1, 3.6, 1.6, 2.4, 3.0, 1.9];
  const colors  = ['#00ffff','#aa00ff','#00ffcc','#ff00aa','#0088ff','#cc00ff','#00ff88','#ff8800','#0044ff','#ff0088'];

  return (
    <group position={[-14.3, 0, 2]}>
      {heights.map((h, i) => (
        <mesh key={i} position={[0, h / 2, (i - 4.5) * 0.7]}>
          <boxGeometry args={[0.08, h, 0.3]} />
          <meshStandardMaterial
            color={colors[i]}
            emissive={colors[i]}
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
      {/* Label */}
      {/* thin base line */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.06, 0.02, 7]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// ── Physics walls ─────────────────────────────────────────────────────────────
function PhysicsWalls() {
  return (
    <>
      <RigidBody type="fixed"><CuboidCollider args={[15, 5, 0.1]} position={[0, 2.5, -15]} /></RigidBody>
      <RigidBody type="fixed"><CuboidCollider args={[15, 5, 0.1]} position={[0, 2.5, 15]} /></RigidBody>
      <RigidBody type="fixed"><CuboidCollider args={[0.1, 5, 15]} position={[-15, 2.5, 0]} /></RigidBody>
      <RigidBody type="fixed"><CuboidCollider args={[0.1, 5, 15]} position={[15, 2.5, 0]} /></RigidBody>
    </>
  );
}

// ── Game logic (movement + animation FSM) ─────────────────────────────────────
function SceneLogic() {
  const { getState, lastKeyTimeRef } = usePlayerController();
  const idleTimerRef = useRef(0);

  const setPlayerPos  = useGameStore((s) => s.setPlayerPos);
  const setPlayerRot  = useGameStore((s) => s.setPlayerRot);
  const setAnimState  = useGameStore((s) => s.setAnimState);
  const setAtDesk     = useGameStore((s) => s.setAtDesk);

  useFrame((_, delta) => {
    const { velocity, isMoving, direction } = getState();
    const pos    = useGameStore.getState().playerPos;
    const atDesk = useGameStore.getState().atDesk;

    const speed  = isMoving ? SPEED : 0;
    const newX   = clamp(pos[0] + velocity[0] * delta * speed, -ROOM_HALF, ROOM_HALF);
    const newZ   = clamp(pos[2] + velocity[2] * delta * speed, -ROOM_HALF, ROOM_HALF);
    const newPos: [number, number, number] = [newX, pos[1], newZ];

    const dx        = newX - DESK_POS.x;
    const dz        = newZ - DESK_POS.z;
    const nearDesk  = Math.sqrt(dx * dx + dz * dz) < DESK_RADIUS;

    if (nearDesk !== atDesk) setAtDesk(nearDesk);

    if (nearDesk) {
      setAnimState('sitting_typing');
      idleTimerRef.current = 0;
    } else if (isMoving) {
      setAnimState('walking');
      idleTimerRef.current = 0;
    } else {
      const timeSinceKey = (Date.now() - lastKeyTimeRef.current) / 1000;
      if (timeSinceKey < IDLE_TIMEOUT) {
        // Keys were pressed recently — reset timer and stay idle
        idleTimerRef.current = 0;
        setAnimState('idle');
      } else {
        // No key pressed for IDLE_TIMEOUT seconds — start accumulating
        idleTimerRef.current += delta;
        setAnimState(idleTimerRef.current > IDLE_TIMEOUT ? 'thinking' : 'idle');
      }
    }

    if (isMoving) setPlayerRot(direction);
    setPlayerPos(newPos);
  });

  return null;
}

// ── Root scene ────────────────────────────────────────────────────────────────
export default function DevRoom() {
  return (
    <Physics gravity={[0, -9.81, 0]}>
      {/* Atmospheric exponential fog */}
      <fogExp2 attach="fog" args={['#000008', 0.022]} />

      <SceneLogic />
      <Floor />
      <RoomWalls />
      <PhysicsWalls />
      <ServerRacks />
      <DataVizBars />
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
