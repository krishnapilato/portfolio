import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { Color, Group, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import { useGameStore } from '../store/gameStore'
import { ZONES, type ZoneConfig } from './zones'

type ZoneManagerProps = {
  planeRef: React.RefObject<Object3D | null>
}

const tmp = new Vector3()

function ZoneMarker({ zone }: { zone: ZoneConfig }) {
  const [hovered, setHovered] = useState(false)
  const padColor = useMemo(() => new Color(zone.color), [zone.color])
  const emissive = useMemo(() => padColor.clone().multiplyScalar(0.6), [padColor])
  const torusMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: padColor,
        emissive: emissive,
        emissiveIntensity: 0.8,
        metalness: 0.45,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85,
      }),
    [padColor, emissive],
  )

  return (
    <group position={zone.position} rotation={[0, Math.PI / 4, 0]}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[2.8, 3.3, 0.5, 36, 1, true]} />
        <meshStandardMaterial
          color={padColor}
          emissive={hovered ? emissive.clone().offsetHSL(0, 0.1, 0.05) : emissive}
          emissiveIntensity={hovered ? 1.2 : 0.85}
          metalness={0.45}
          roughness={0.35}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.12, 10, 48]} />
        <primitive object={torusMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color={padColor}
          emissive={hovered ? emissive : emissive.clone().multiplyScalar(0.6)}
          emissiveIntensity={1.1}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}

function ZoneManager({ planeRef }: ZoneManagerProps) {
  const setZone = useGameStore((s) => s.setZone)
  const setCameraMode = useGameStore((s) => s.setCinematic)
  const currentZone = useGameStore((s) => s.currentZone)
  const markerGroup = useRef<Group | null>(null)
  const [nearest, setNearest] = useState<ZoneConfig | null>(null)

  useFrame(() => {
    if (!planeRef.current || !markerGroup.current) return
    const planePos = planeRef.current.getWorldPosition(tmp)
    let closest: ZoneConfig | null = null
    let closestDist = Number.POSITIVE_INFINITY

    markerGroup.current.children.forEach((child, idx) => {
      const zone = ZONES[idx]
      if (!zone) return
      const worldPos = (child as Object3D).getWorldPosition(tmp)
      const dist = worldPos.distanceTo(planePos)
      if (dist < closestDist) {
        closestDist = dist
        closest = zone
      }
    })

    setNearest(closest)
    const activeId = closest ? (closest as ZoneConfig).id : null
    if (activeId && closestDist < 12 && currentZone !== activeId) {
      setZone(activeId)
      setCameraMode(true, 'focus')
    } else if (closestDist > 18 && currentZone !== 'none') {
      setZone('none')
      setCameraMode(false, 'follow')
    }
  })

  return (
    <group ref={markerGroup}>
      {ZONES.map((zone) => (
        <ZoneMarker key={zone.id} zone={zone} />
      ))}
      {nearest && (
        <mesh position={[...nearest.position]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.4, 48]} />
          <meshBasicMaterial color={nearest.accent} transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  )
}

export default ZoneManager
