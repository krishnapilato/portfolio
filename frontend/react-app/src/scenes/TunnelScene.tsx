import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Types ───────────────────────────────────────────────────────────────────
export type ColorTheme = 'cosmic' | 'cyber' | 'void'

export interface TunnelSettings {
  tunnelSpeed: number
  ringCount: number
  bloomIntensity: number
  showParticles: boolean
  particleCount: number
  colorTheme: ColorTheme
}

interface ThemeColors {
  hue1: number
  hue2: number
  sat: number
  lit: number
}

// ─── Theme Definitions ───────────────────────────────────────────────────────
const THEMES: Record<ColorTheme, ThemeColors> = {
  cosmic: { hue1: 0.76, hue2: 0.54, sat: 0.95, lit: 0.55 },
  cyber:  { hue1: 0.36, hue2: 0.16, sat: 0.90, lit: 0.50 },
  void:   { hue1: 0.62, hue2: 0.62, sat: 0.50, lit: 0.70 },
}

// ─── Module-level reusable objects (never recreated) ─────────────────────────
const _dummy = new THREE.Object3D()
const _col   = new THREE.Color()

const RING_SPACING = 5

// ─── Ring Data Type ───────────────────────────────────────────────────────────
interface RingData {
  z: number
  rot: number
  tiltX: number
  tiltY: number
  scale: number
}

function initRings(count: number): RingData[] {
  return Array.from({ length: count }, (_, i) => ({
    z: -(i * RING_SPACING),
    rot: (i / count) * Math.PI * 4,
    tiltX: (Math.random() - 0.5) * 0.2,
    tiltY: (Math.random() - 0.5) * 0.1,
    scale: 0.85 + Math.random() * 0.3,
  }))
}

// ─── Tunnel Rings ─────────────────────────────────────────────────────────────
interface TunnelRingsProps {
  speed: number
  ringCount: number
  colorTheme: ColorTheme
}

function TunnelRings({ speed, ringCount, colorTheme }: TunnelRingsProps) {
  const outerRef = useRef<THREE.InstancedMesh>(null)
  const innerRef = useRef<THREE.InstancedMesh>(null)

  const ringsRef = useRef<RingData[]>(initRings(ringCount))
  const prevCountRef = useRef(ringCount)

  // Reinit when ring count changes
  if (prevCountRef.current !== ringCount) {
    prevCountRef.current = ringCount
    ringsRef.current = initRings(ringCount)
  }

  const outerGeo = useMemo(() => new THREE.TorusGeometry(3.6, 0.022, 8, 96), [])
  const innerGeo = useMemo(() => new THREE.TorusGeometry(2.0, 0.014, 6, 80), [])
  const sharedMat = useMemo(
    () => new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    []
  )

  useEffect(() => {
    return () => {
      outerGeo.dispose()
      innerGeo.dispose()
      sharedMat.dispose()
    }
  }, [outerGeo, innerGeo, sharedMat])

  useFrame((state, delta) => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const rings = ringsRef.current
    if (rings.length !== ringCount) return

    const theme = THEMES[colorTheme]
    const total = ringCount * RING_SPACING
    const t = state.clock.elapsedTime

    for (let i = 0; i < ringCount; i++) {
      // Advance ring toward camera
      rings[i].z += speed * delta * 14
      if (rings[i].z > 8) rings[i].z -= total

      const z = rings[i].z
      // Depth 0→1 as ring approaches camera (0=far, 1=near)
      const depth = Math.max(0, Math.min(1, 1 - Math.abs(z) / (ringCount * RING_SPACING * 0.55)))

      // Breathing scale pulse
      const breathe = rings[i].scale * (1 + Math.sin(t * 0.8 + i * 0.3) * 0.025)

      // ─ Outer ring matrix ─────────────────────────────────────────────────
      _dummy.position.set(0, 0, z)
      _dummy.rotation.set(rings[i].tiltX, rings[i].tiltY, rings[i].rot + t * speed * 0.15)
      _dummy.scale.setScalar(breathe)
      _dummy.updateMatrix()
      outer.setMatrixAt(i, _dummy.matrix)

      const hue = theme.hue1 + (theme.hue2 - theme.hue1) * (0.3 + depth * 0.7)
      _col.setHSL(hue, theme.sat, theme.lit * (0.12 + depth * 0.92))
      outer.setColorAt(i, _col)

      // ─ Inner ring matrix (interlaced offset) ─────────────────────────────
      _dummy.position.set(0, 0, z + RING_SPACING * 0.5)
      _dummy.rotation.set(-rings[i].tiltX * 0.6, rings[i].tiltY * 0.6, -rings[i].rot * 0.7 - t * speed * 0.08)
      _dummy.scale.setScalar(breathe * 0.56)
      _dummy.updateMatrix()
      inner.setMatrixAt(i, _dummy.matrix)

      _col.setHSL(theme.hue2, theme.sat * 0.65, theme.lit * (0.08 + depth * 0.5))
      inner.setColorAt(i, _col)
    }

    outer.instanceMatrix.needsUpdate = true
    inner.instanceMatrix.needsUpdate = true
    if (outer.instanceColor) outer.instanceColor.needsUpdate = true
    if (inner.instanceColor) inner.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh key={`o-${ringCount}`} ref={outerRef} args={[outerGeo, sharedMat, ringCount]} />
      <instancedMesh key={`i-${ringCount}`} ref={innerRef} args={[innerGeo, sharedMat, ringCount]} />
    </>
  )
}

// ─── Particles ────────────────────────────────────────────────────────────────
interface ParticlesProps {
  count: number
  speed: number
  colorTheme: ColorTheme
}

function Particles({ count, speed, colorTheme }: ParticlesProps) {
  const ptsRef = useRef<THREE.Points>(null)

  const { geo, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2
      const radius = Math.random() * 3.2
      pos[i * 3]     = Math.cos(angle) * radius
      pos[i * 3 + 1] = Math.sin(angle) * radius
      pos[i * 3 + 2] = -(Math.random() * getMaxParticleZ(count))
      vel[i] = 0.25 + Math.random() * 0.75
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo: g, velocities: vel }
  }, [count])

  useEffect(() => () => geo.dispose(), [geo])

  useFrame((state, delta) => {
    const pts = ptsRef.current
    if (!pts) return
    const pos = pts.geometry.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    const maxZ = getMaxParticleZ(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] += speed * velocities[i] * delta * 14
      if (pos[i * 3 + 2] > 10) pos[i * 3 + 2] -= maxZ + 10 + Math.random() * 30
      // subtle twinkle via opacity done via material opacity (global), just scale with time for life
      const twinkle = 0.3 + Math.abs(Math.sin(t * 3.1 + i * 0.7)) * 0.7
      pos[i * 3] *= (1 + (twinkle - 0.5) * PARTICLE_DRIFT_FACTOR)
    }
    pts.geometry.attributes.position.needsUpdate = true
  })

  const color = useMemo(() => {
    const th = THEMES[colorTheme]
    return new THREE.Color().setHSL(th.hue2, th.sat * 0.7, 0.85)
  }, [colorTheme])

  return (
    <points key={`pts-${count}`} ref={ptsRef} geometry={geo}>
      <pointsMaterial
        color={color}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  )
}

/** Returns the maximum Z-depth used for particle distribution along the tunnel. */
function getMaxParticleZ(count: number) {
  return Math.max(200, count * 0.4)
}

/** Small per-particle XZ drift factor – keeps particles from feeling perfectly static. */
const PARTICLE_DRIFT_FACTOR = 0.0001

// ─── Central Glow Core ───────────────────────────────────────────────────────
function TunnelCore({ colorTheme }: { colorTheme: ColorTheme }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const s = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.12
    meshRef.current.scale.setScalar(s)
  })

  const col = useMemo(() => {
    const th = THEMES[colorTheme]
    return new THREE.Color().setHSL(th.hue1, th.sat, 0.75)
  }, [colorTheme])

  return (
    <mesh ref={meshRef} position={[0, 0, -200]}>
      <sphereGeometry args={[0.6, 12, 12]} />
      <meshBasicMaterial color={col} toneMapped={false} />
    </mesh>
  )
}

// ─── Camera Rig (gentle drift) ────────────────────────────────────────────────
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = Math.sin(t * 0.07) * 0.18
    state.camera.position.y = Math.cos(t * 0.11) * 0.10
  })
  return null
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
interface TunnelSceneProps {
  settings: TunnelSettings
}

export default function TunnelScene({ settings }: TunnelSceneProps) {
  const {
    tunnelSpeed,
    ringCount,
    bloomIntensity,
    showParticles,
    particleCount,
    colorTheme,
  } = settings

  return (
    <>
      <color attach="background" args={['#000009']} />
      <fogExp2 attach="fog" args={[0x000009, 0.012]} />

      <CameraRig />

      <TunnelRings speed={tunnelSpeed} ringCount={ringCount} colorTheme={colorTheme} />

      <TunnelCore colorTheme={colorTheme} />

      {showParticles && (
        <Particles count={particleCount} speed={tunnelSpeed} colorTheme={colorTheme} />
      )}

      <Stars
        radius={120}
        depth={60}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.04}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.12} darkness={1.15} />
      </EffectComposer>
    </>
  )
}
