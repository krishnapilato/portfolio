import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MouseParallax } from '../hooks/useMouseParallax'

interface FloatingJavaOrbProps {
  mouseRef: React.RefObject<MouseParallax>
}

export function FloatingJavaOrb({ mouseRef }: FloatingJavaOrbProps) {
  const orbRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (orbRef.current) {
      orbRef.current.rotation.y += delta * 0.4
      orbRef.current.rotation.x += delta * 0.1
      orbRef.current.rotation.z = THREE.MathUtils.lerp(orbRef.current.rotation.z, (mouseRef.current?.x ?? 0) * 0.15, 0.05)
      orbRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.15
    }
    if (innerRef.current) {
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.08
      innerRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group>
      {/* Outer glow sphere */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#ff9f00"
          emissive="#ff6600"
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
          wireframe={false}
        />
      </mesh>
      {/* Coffee bean shape: slightly flattened sphere with a seam */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#3d1c00"
          emissive="#ff9f00"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Seam line (torus) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.08, 8, 60]} />
        <meshStandardMaterial color="#ff9f00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
      {/* Point light from orb */}
      <pointLight color="#ff9f00" intensity={4} distance={8} decay={2} />
    </group>
  )
}
