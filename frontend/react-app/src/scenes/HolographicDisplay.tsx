import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface PanelConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  label: string;
  subtext: string;
  floatOffset: number;
}

const panels: PanelConfig[] = [
  {
    position: [-6, 2.2, -5],
    rotation: [0, 0.5, 0],
    color: '#0044ff',
    label: 'SKILL.DB',
    subtext: 'TypeScript · React · Three.js\nRust · Python · Go',
    floatOffset: 0,
  },
  {
    position: [6, 2.2, -5],
    rotation: [0, -0.5, 0],
    color: '#aa00ff',
    label: 'PROJECTS.EXE',
    subtext: 'Portfolio · Games · Tools\n> 42 deployed',
    floatOffset: 1.5,
  },
  {
    position: [0, 3.2, -3],
    rotation: [0, 0, 0],
    color: '#00ffff',
    label: 'ABOUT.ME',
    subtext: 'Full-Stack Dev\nCyberpunk enthusiast',
    floatOffset: 0.8,
  },
];

function HoloPanel({ position, rotation, color, label, subtext, floatOffset }: PanelConfig) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + floatOffset;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.12;
    groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.04;
  });

  return (
    <group ref={groupRef} position={position} rotation={new THREE.Euler(...rotation)}>
      {/* Panel backing */}
      <mesh>
        <boxGeometry args={[1.4, 0.85, 0.01]} />
        <meshStandardMaterial
          color="#000011"
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border glow */}
      <mesh>
        <boxGeometry args={[1.44, 0.89, 0.008]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>

      {/* Label text */}
      <Text
        position={[0, 0.26, 0.02]}
        fontSize={0.13}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`> ${label}`}
      </Text>

      {/* Sub text */}
      <Text
        position={[0, -0.05, 0.02]}
        fontSize={0.072}
        color="#aaccff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.2}
        textAlign="center"
        font={undefined}
      >
        {subtext}
      </Text>

      {/* Scan line animation hint — thin bright bar */}
      <mesh position={[0, -0.3, 0.015]}>
        <boxGeometry args={[1.36, 0.01, 0.002]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

export default function HolographicDisplay() {
  return (
    <>
      {panels.map((p, i) => (
        <HoloPanel key={i} {...p} />
      ))}
    </>
  );
}
