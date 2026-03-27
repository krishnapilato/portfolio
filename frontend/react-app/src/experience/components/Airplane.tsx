import { memo, useMemo } from 'react'
import { Color } from 'three'

const Airplane = () => {
  const accent = useMemo(() => new Color('#67e8f9'), [])
  const hull = useMemo(() => new Color('#93c5fd'), [])

  return (
    <group>
      <mesh castShadow receiveShadow>
        <coneGeometry args={[0.35, 2, 18, 1]} />
        <meshStandardMaterial color={hull} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.22, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial color={hull} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.22, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.06, 1]} />
        <meshStandardMaterial color={hull} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.9]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.6]} />
        <meshStandardMaterial color={accent} emissive={accent.clone().multiplyScalar(0.35)} />
      </mesh>
      <mesh position={[0, 0.35, -0.4]}>
        <boxGeometry args={[0.25, 0.06, 0.3]} />
        <meshStandardMaterial color={hull.clone().offsetHSL(-0.02, 0.1, 0.1)} />
      </mesh>
    </group>
  )
}

export default memo(Airplane)
