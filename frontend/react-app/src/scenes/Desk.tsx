import { Text } from '@react-three/drei';
import * as THREE from 'three';

const deskMat = new THREE.MeshStandardMaterial({
  color: '#0a0a1f',
  emissive: '#002233',
  emissiveIntensity: 0.4,
  roughness: 0.3,
  metalness: 0.8,
});

const monitorMat = new THREE.MeshStandardMaterial({
  color: '#000811',
  emissive: '#00ffff',
  emissiveIntensity: 0.6,
  roughness: 0.1,
  metalness: 0.5,
});

const glowCyanMat = new THREE.MeshStandardMaterial({
  color: '#001122',
  emissive: '#00ffff',
  emissiveIntensity: 1.0,
  roughness: 0.2,
  metalness: 0.7,
});

const chairMat = new THREE.MeshStandardMaterial({
  color: '#080818',
  emissive: '#220044',
  emissiveIntensity: 0.3,
  roughness: 0.5,
  metalness: 0.6,
});

export default function Desk() {
  return (
    <group position={[0, 0, -8]}>
      {/* Desk surface */}
      <mesh position={[0, 0.85, 0]} material={deskMat} castShadow receiveShadow>
        <boxGeometry args={[3, 0.08, 1.5]} />
      </mesh>

      {/* Desk body */}
      <mesh position={[0, 0.42, 0]} material={deskMat} castShadow>
        <boxGeometry args={[2.8, 0.85, 1.3]} />
      </mesh>

      {/* Cyan edge trim — front */}
      <mesh position={[0, 0.85, 0.76]} material={glowCyanMat}>
        <boxGeometry args={[3.02, 0.06, 0.02]} />
      </mesh>

      {/* Monitor base */}
      <mesh position={[0, 0.95, -0.5]} material={deskMat}>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
      </mesh>

      {/* Monitor stand */}
      <mesh position={[0, 1.2, -0.5]} material={deskMat}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
      </mesh>

      {/* Monitor screen */}
      <mesh position={[0, 1.55, -0.55]} material={monitorMat} castShadow>
        <boxGeometry args={[1.6, 0.9, 0.05]} />
      </mesh>

      {/* Monitor frame */}
      <mesh position={[0, 1.55, -0.52]} material={glowCyanMat}>
        <boxGeometry args={[1.64, 0.94, 0.01]} />
      </mesh>

      {/* Monitor text */}
      <Text
        position={[0, 1.55, -0.52]}
        fontSize={0.08}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {`> SYSTEM ONLINE\n> INITIALIZING...\n> ALL SYSTEMS GO`}
      </Text>

      {/* Keyboard */}
      <mesh position={[0, 0.9, 0.1]} material={deskMat} castShadow>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
      </mesh>

      {/* Keyboard glow strip */}
      <mesh position={[0, 0.912, 0.1]} material={glowCyanMat}>
        <boxGeometry args={[0.78, 0.005, 0.28]} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.55, 0.895, 0.1]} material={deskMat}>
        <boxGeometry args={[0.1, 0.02, 0.15]} />
      </mesh>

      {/* Left floating holographic side screen */}
      <mesh position={[-1.5, 1.4, -0.3]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.01]} />
        <meshStandardMaterial
          color="#000033"
          emissive="#0044ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right floating holographic side screen */}
      <mesh position={[1.5, 1.4, -0.3]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.01]} />
        <meshStandardMaterial
          color="#000033"
          emissive="#aa00ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Chair — seat */}
      <mesh position={[0, 0.42, 0.8]} material={chairMat} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.65]} />
      </mesh>

      {/* Chair — back */}
      <mesh position={[0, 0.82, 1.1]} material={chairMat} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.06]} />
      </mesh>

      {/* Chair legs */}
      {[[-0.3, 0], [0.3, 0], [-0.3, 0.6], [0.3, 0.6]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.21, 0.8 + lz - 0.3]} material={chairMat}>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 6]} />
        </mesh>
      ))}
    </group>
  );
}
