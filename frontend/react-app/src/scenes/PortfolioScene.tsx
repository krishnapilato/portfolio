import { useRef, useMemo, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { FloatingJavaOrb } from '../components/FloatingJavaOrb'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { SKILL_CARDS, usePortfolioStore } from '../store/usePortfolioStore'
import type { SkillCard } from '../store/usePortfolioStore'
import { useGameProgress } from '../hooks/useGameProgress'

// Floating skill card mesh
function SkillOrbit({ skill, index, total }: { skill: SkillCard; index: number; total: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const openSkillModal = usePortfolioStore((s) => s.openSkillModal)
  const { progress } = useGameProgress()
  const angle = (index / total) * Math.PI * 2
  const radius = 3.2

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      const currentAngle = angle + t * 0.3
      meshRef.current.position.x = Math.cos(currentAngle) * radius
      meshRef.current.position.z = Math.sin(currentAngle) * radius
      meshRef.current.position.y = Math.sin(t * 0.8 + index) * 0.3
      meshRef.current.rotation.y = -currentAngle + Math.PI / 2
    }
  })

  const handleClick = () => {
    openSkillModal(skill)
    progress(15)
  }

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <boxGeometry args={[1.1, 0.6, 0.06]} />
      <meshStandardMaterial
        color={skill.color}
        emissive={skill.color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.85}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  )
}

// Particles background
function CodeParticles() {
  const count = 800
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [])

  const geoRef = useRef<THREE.BufferGeometry>(null)

  useFrame(() => {
    if (geoRef.current) {
      const pos = geoRef.current.attributes['position'] as THREE.BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] -= 0.005
        if (arr[i * 3 + 1] < -10) {
          arr[i * 3 + 1] = 10
        }
      }
      pos.needsUpdate = true
    }
  })

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00f7ff" size={0.04} sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

// Grid floor
function GridFloor() {
  return (
    <gridHelper
      args={[80, 80, '#00f7ff', '#111']}
      position={[0, -3, 0]}
    />
  )
}

// Camera parallax controller
function CameraRig({ mouseRef }: { mouseRef: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()

  useFrame(() => {
    if (!mouseRef.current) return
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 1.5, 0.02)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1 + mouseRef.current.y * -0.8, 0.02)
  })

  return null
}

export function PortfolioScene() {
  const mouseRef = useMouseParallax()

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 5, -5]} color="#ff00aa" intensity={2} />
      <pointLight position={[5, -2, 5]} color="#00f7ff" intensity={1.5} />

      <fog attach="fog" args={['#0a0a0a', 10, 50]} />

      <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <CodeParticles />
      <GridFloor />

      <FloatingJavaOrb mouseRef={mouseRef} />

      {SKILL_CARDS.map((skill, i) => (
        <SkillOrbit key={skill.id} skill={skill} index={i} total={SKILL_CARDS.length} />
      ))}

      <CameraRig mouseRef={mouseRef} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
    </Suspense>
  )
}
