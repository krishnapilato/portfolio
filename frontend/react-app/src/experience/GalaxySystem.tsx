import { Instances, Instance } from '@react-three/drei'
import { useMemo } from 'react'
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
} from 'three'
import { useGameStore } from '../store/gameStore'

type GalaxySystemProps = {
  radius?: number
}

const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5
  return () => {
    t |= 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function GalaxySystem({ radius = 220 }: GalaxySystemProps) {
  const tier = useGameStore((s) => s.performanceTier)
  const starCount = tier === 'potato' ? 500 : tier === 'low' ? 900 : tier === 'medium' ? 1500 : 2200
  const planetCount = tier === 'potato' ? 8 : 14
  // Limit real lights to avoid uniform overflow on low-end/mobile GPUs
  const lightCount = tier === 'potato' ? 4 : tier === 'low' ? 6 : tier === 'medium' ? 8 : 12

  const starGeometry = useMemo(() => {
    const random = mulberry32(1337 + starCount + Math.floor(radius * 10))
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i += 1) {
      const r = random() * radius
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      positions.set([x, y, z], i * 3)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [radius, starCount])

  const planetSeeds = useMemo(
    () =>
      Array.from({ length: planetCount }, (_, i) => {
        const random = mulberry32(4200 + i * 13 + planetCount)
        return {
          position: [
            (random() - 0.5) * radius * 0.9,
            (random() - 0.5) * radius * 0.5,
            (random() - 0.5) * radius * 0.9,
          ] as [number, number, number],
          scale: 2.4 + random() * 2.4 + i * 0.1,
          color: new Color().setHSL(random(), 0.45, 0.55),
        }
      }),
    [planetCount, radius],
  )

  const lightSeeds = useMemo(
    () =>
      Array.from({ length: lightCount }, (_, i) => {
        const random = mulberry32(9100 + i * 17 + lightCount)
        return {
          position: [
            (random() - 0.5) * radius,
            (random() - 0.5) * radius * 0.7,
            (random() - 0.5) * radius,
          ] as [number, number, number],
          intensity: 0.2 + random() * 1.6,
          color: new Color().setHSL(0.55 + random() * 0.2, 0.9, 0.6),
        }
      }),
    [lightCount, radius],
  )

  const lightGeometry = useMemo(() => {
    const positions = new Float32Array(lightSeeds.flatMap((l) => [...l.position]))
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [lightSeeds])

  return (
    <group>
      <points geometry={starGeometry}>
        <pointsMaterial
          size={1.2}
          sizeAttenuation
          transparent
          depthWrite={false}
          color={new Color('#9dd5ff')}
          opacity={0.9}
        />
      </points>

      <Instances limit={planetCount} castShadow receiveShadow>
        <sphereGeometry args={[1, 28, 28]} />
        <meshStandardMaterial metalness={0.15} roughness={0.65} />
        {planetSeeds.map((planet, idx) => (
          <Instance
            key={idx}
            position={planet.position}
            scale={planet.scale}
            color={planet.color}
          />
        ))}
      </Instances>

      {lightSeeds.map((light, idx) => (
        <pointLight
          key={idx}
          position={light.position}
          distance={32}
          intensity={light.intensity}
          color={light.color}
          castShadow={false}
        />
      ))}

      <mesh>
        <icosahedronGeometry args={[radius, 2]} />
        <meshBasicMaterial color="#02040b" side={BackSide} />
      </mesh>

      <points geometry={lightGeometry}>
        <pointsMaterial
          size={2.3}
          color="#7dd3fc"
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.5}
        />
      </points>
    </group>
  )
}

export default GalaxySystem
