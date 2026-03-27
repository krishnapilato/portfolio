import { Text } from '@react-three/drei';
import * as THREE from 'three';

const deskMat = new THREE.MeshStandardMaterial({
  color: '#08081e',
  emissive: '#001830',
  emissiveIntensity: 0.35,
  roughness: 0.25,
  metalness: 0.85,
});

const monitorMat = new THREE.MeshStandardMaterial({
  color: '#000810',
  emissive: '#00ccee',
  emissiveIntensity: 0.55,
  roughness: 0.05,
  metalness: 0.6,
});

const monitorFrameMat = new THREE.MeshStandardMaterial({
  color: '#0a0a20',
  roughness: 0.4,
  metalness: 0.9,
});

const glowCyanMat = new THREE.MeshStandardMaterial({
  color: '#001122',
  emissive: '#00ffff',
  emissiveIntensity: 1.2,
  roughness: 0.1,
  metalness: 0.7,
});

const glowAmberMat = new THREE.MeshStandardMaterial({
  color: '#110800',
  emissive: '#ff7700',
  emissiveIntensity: 1.5,
  roughness: 0.1,
  metalness: 0.5,
});

const chairMat = new THREE.MeshStandardMaterial({
  color: '#06060f',
  emissive: '#110033',
  emissiveIntensity: 0.4,
  roughness: 0.45,
  metalness: 0.7,
});

// Side screens are only used once each — prebuilt as constants
const sideScreenBlueMat = new THREE.MeshStandardMaterial({
  color: '#000018',
  emissive: '#0055ff',
  emissiveIntensity: 0.7,
  transparent: true,
  opacity: 0.75,
  side: THREE.DoubleSide,
});

const mugBodyMat = new THREE.MeshStandardMaterial({
  color: '#0a0a1a',
  roughness: 0.4,
  metalness: 0.5,
});

const chairCushionMat = new THREE.MeshStandardMaterial({
  color: '#0a0a22',
  roughness: 0.8,
  metalness: 0.2,
  emissive: '#110033',
  emissiveIntensity: 0.3,
});


export default function Desk() {
  return (
    <group position={[0, 0, -8]}>
      {/* ── Desk body ── */}
      <mesh position={[0, 0.44, 0]} material={deskMat} castShadow>
        <boxGeometry args={[3.2, 0.88, 1.4]} />
      </mesh>

      {/* Desk surface */}
      <mesh position={[0, 0.89, 0]} material={deskMat} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.07, 1.55]} />
      </mesh>

      {/* Cyan edge trim — front */}
      <mesh position={[0, 0.89, 0.79]} material={glowCyanMat}>
        <boxGeometry args={[3.42, 0.05, 0.018]} />
      </mesh>
      {/* Cyan edge trim — left */}
      <mesh position={[-1.72, 0.89, 0]} material={glowCyanMat}>
        <boxGeometry args={[0.018, 0.05, 1.55]} />
      </mesh>
      {/* Cyan edge trim — right */}
      <mesh position={[1.72, 0.89, 0]} material={glowCyanMat}>
        <boxGeometry args={[0.018, 0.05, 1.55]} />
      </mesh>

      {/* ── Main monitor (centre) ── */}
      <mesh position={[0, 0.98, -0.52]} material={monitorFrameMat}>
        <boxGeometry args={[0.28, 0.09, 0.2]} />
      </mesh>
      <mesh position={[0, 1.25, -0.52]} material={monitorFrameMat}>
        <boxGeometry args={[0.055, 0.52, 0.055]} />
      </mesh>
      <mesh position={[0, 1.62, -0.56]} material={monitorFrameMat} castShadow>
        <boxGeometry args={[1.72, 0.98, 0.06]} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 1.62, -0.52]} material={monitorMat}>
        <boxGeometry args={[1.62, 0.88, 0.01]} />
      </mesh>
      <Text position={[0, 1.72, -0.51]} fontSize={0.07} color="#00ffff" anchorX="center" anchorY="middle" maxWidth={1.4}>
        {`> SYSTEM ONLINE\n> ALL MODULES LOADED\n> READY`}
      </Text>
      <Text position={[0, 1.5, -0.51]} fontSize={0.055} color="#007799" anchorX="center" anchorY="middle" maxWidth={1.4}>
        {`CPU 12%  RAM 4.2GB  GPU 31%\n[████████████░░░░░░░░] 62%`}
      </Text>

      {/* ── Side monitor (right, angled) ── */}
      <mesh position={[1.1, 0.98, -0.35]} material={monitorFrameMat}>
        <boxGeometry args={[0.2, 0.08, 0.16]} />
      </mesh>
      <mesh position={[1.1, 1.2, -0.35]} material={monitorFrameMat}>
        <boxGeometry args={[0.045, 0.42, 0.045]} />
      </mesh>
      <mesh position={[1.1, 1.52, -0.4]} rotation={[0, -0.35, 0]} material={monitorFrameMat} castShadow>
        <boxGeometry args={[1.1, 0.65, 0.05]} />
      </mesh>
      <mesh position={[1.1, 1.52, -0.36]} rotation={[0, -0.35, 0]}>
        <boxGeometry args={[1.02, 0.57, 0.01]} />
        <meshStandardMaterial color="#000a10" emissive="#aa00ff" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      <Text
        position={[1.05, 1.52, -0.34]}
        rotation={[0, -0.35, 0]}
        fontSize={0.055}
        color="#bb44ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
      >
        {`PROJECTS.EXE\n> 42 deployed\n> 8 in progress`}
      </Text>

      {/* ── Keyboard ── */}
      <mesh position={[0, 0.925, 0.15]} material={deskMat} castShadow>
        <boxGeometry args={[0.88, 0.018, 0.32]} />
      </mesh>
      {/* Keyboard RGB strip */}
      <mesh position={[0, 0.935, 0.15]} material={glowCyanMat}>
        <boxGeometry args={[0.85, 0.004, 0.3]} />
      </mesh>

      {/* ── Mouse ── */}
      <mesh position={[0.62, 0.92, 0.12]} material={deskMat}>
        <boxGeometry args={[0.1, 0.018, 0.16]} />
      </mesh>
      {/* Mouse scroll wheel accent */}
      <mesh position={[0.62, 0.935, 0.08]} material={glowCyanMat}>
        <boxGeometry args={[0.02, 0.004, 0.04]} />
      </mesh>

      {/* ── Coffee mug ── */}
      <mesh position={[-0.9, 0.96, 0.22]} material={mugBodyMat}>
        <cylinderGeometry args={[0.055, 0.045, 0.12, 12]} />
      </mesh>
      {/* Mug liquid glow */}
      <mesh position={[-0.9, 1.016, 0.22]}>
        <cylinderGeometry args={[0.048, 0.048, 0.01, 12]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
      </mesh>

      {/* ── Left floating holographic side display ── */}
      <mesh position={[-1.6, 1.5, -0.25]} rotation={[0, 0.28, 0]}>
        <boxGeometry args={[0.85, 0.55, 0.008]} />
        <primitive object={sideScreenBlueMat} attach="material" />
      </mesh>
      <Text
        position={[-1.57, 1.5, -0.22]}
        rotation={[0, 0.28, 0]}
        fontSize={0.055}
        color="#4488ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.75}
      >
        {`SKILL.DB\nTS · React · Three.js\nRust · Python · Go`}
      </Text>

      {/* ── Chair ── */}
      {/* Seat */}
      <mesh position={[0, 0.44, 0.9]} material={chairMat} castShadow>
        <boxGeometry args={[0.72, 0.07, 0.68]} />
      </mesh>
      {/* Seat cushion highlight */}
      <mesh position={[0, 0.48, 0.9]} material={chairCushionMat}>
        <boxGeometry args={[0.66, 0.04, 0.62]} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.95, 1.2]} material={chairMat} castShadow>
        <boxGeometry args={[0.72, 0.88, 0.07]} />
      </mesh>
      {/* Backrest top glow strip */}
      <mesh position={[0, 1.41, 1.2]} material={glowAmberMat}>
        <boxGeometry args={[0.7, 0.025, 0.06]} />
      </mesh>
      {/* Chair legs */}
      {([ [-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3] ] as [number, number][]).map(([lx, lzOff], i) => (
        <mesh key={i} position={[lx, 0.22, 0.9 + lzOff]} material={chairMat}>
          <cylinderGeometry args={[0.022, 0.022, 0.44, 6]} />
        </mesh>
      ))}
      {/* Arm rests */}
      <mesh position={[-0.38, 0.7, 0.9]} material={chairMat}>
        <boxGeometry args={[0.06, 0.04, 0.5]} />
      </mesh>
      <mesh position={[0.38, 0.7, 0.9]} material={chairMat}>
        <boxGeometry args={[0.06, 0.04, 0.5]} />
      </mesh>
    </group>
  );
}
