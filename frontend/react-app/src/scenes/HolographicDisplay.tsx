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
  width: number;
  height: number;
}

const panels: PanelConfig[] = [
  {
    position: [-5.5, 2.4, -6],
    rotation: [0, 0.45, 0],
    color: '#0066ff',
    label: 'SKILL.DB',
    subtext: 'TypeScript · React · Three.js\nRust  ·  Python  ·  Go\nDocker  ·  AWS  ·  Linux',
    floatOffset: 0,
    width: 1.8,
    height: 1.1,
  },
  {
    position: [5.5, 2.4, -6],
    rotation: [0, -0.45, 0],
    color: '#aa00ff',
    label: 'PROJECTS.EXE',
    subtext: 'Portfolio  ·  Games  ·  Tools\n> 42 deployed  |  8 WIP\nGitHub: krishnapilato',
    floatOffset: 1.4,
    width: 1.8,
    height: 1.1,
  },
  {
    position: [0, 3.5, -4],
    rotation: [0, 0, 0],
    color: '#00ffcc',
    label: 'ABOUT.ME',
    subtext: 'Full-Stack Engineer\nCyberpunk Enthusiast\nOpen to collabs',
    floatOffset: 0.7,
    width: 1.6,
    height: 1.0,
  },
];

function HoloPanel({ position, rotation, color, label, subtext, floatOffset, width, height }: PanelConfig) {
  const groupRef  = useRef<THREE.Group>(null);
  const scanRef   = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + floatOffset;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.14;
    groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.25) * 0.05;

    // Animated scan line: sweeps from bottom to top
    if (scanRef.current) {
      scanRef.current.position.y = -height * 0.5 + ((t * 0.4) % height);
    }
  });

  const borderW = width + 0.04;
  const borderH = height + 0.04;

  return (
    <group ref={groupRef} position={position} rotation={new THREE.Euler(...rotation)}>
      {/* Translucent backing */}
      <mesh>
        <boxGeometry args={[width, height, 0.01]} />
        <meshStandardMaterial
          color="#00000a"
          emissive={color}
          emissiveIntensity={0.12}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Neon border frame */}
      <mesh>
        <boxGeometry args={[borderW, borderH, 0.006]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* Corner accents */}
      {([
        [ width * 0.5 - 0.06,  height * 0.5 - 0.06],
        [-width * 0.5 + 0.06,  height * 0.5 - 0.06],
        [ width * 0.5 - 0.06, -height * 0.5 + 0.06],
        [-width * 0.5 + 0.06, -height * 0.5 + 0.06],
      ] as [number, number][]).map(([cx, cy], i) => (
        <mesh key={i} position={[cx, cy, 0.012]}>
          <boxGeometry args={[0.1, 0.01, 0.002]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Scrolling scan line */}
      <mesh ref={scanRef} position={[0, 0, 0.012]}>
        <boxGeometry args={[width - 0.04, 0.008, 0.002]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.6} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, height * 0.5 - 0.14, 0.015]}
        fontSize={0.13}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`▸ ${label}`}
      </Text>

      {/* Divider */}
      <mesh position={[0, height * 0.5 - 0.25, 0.013]}>
        <boxGeometry args={[width - 0.1, 0.006, 0.001]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>

      {/* Body text */}
      <Text
        position={[0, -0.04, 0.015]}
        fontSize={0.075}
        color="#aaccff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.16}
        textAlign="center"
        lineHeight={1.5}
        font={undefined}
      >
        {subtext}
      </Text>
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
