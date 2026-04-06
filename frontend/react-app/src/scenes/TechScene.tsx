import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import content from '../data/content.json'

interface TechItemProps {
  name: string
  color: string
  position: [number, number, number]
  index: number
}

function TechItem({ name, color, position, index }: TechItemProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.3 + index * 0.5
  })

  return (
    <Float speed={1.5 + index * 0.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        <mesh>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            wireframe
          />
        </mesh>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mF71Q-gowFXNvNg.woff2"
        >
          {name}
        </Text>
      </group>
    </Float>
  )
}

export function TechScene() {
  const items = content.techStack.items

  const positions = useMemo((): [number, number, number][] => {
    return items.map((_, i) => {
      const angle = (i / items.length) * Math.PI * 2
      const radius = 3 + (i % 3) * 1.5
      const y = (i % 4 - 1.5) * 1.2
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.5]
    })
  }, [items])

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} color="#00f5ff" intensity={2} />
      <pointLight position={[-5, -5, -5]} color="#7b00ff" intensity={1} />
      {items.map((item, i) => (
        <TechItem
          key={item.name}
          name={item.name}
          color={item.color}
          position={positions[i]}
          index={i}
        />
      ))}
    </Canvas>
  )
}
