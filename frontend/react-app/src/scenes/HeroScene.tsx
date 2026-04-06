import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

const PARTICLE_COUNT = 2000

function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const gpuTier = useStore((s) => s.gpuTier)
  const count = gpuTier === 'low' ? 500 : gpuTier === 'medium' ? 1000 : PARTICLE_COUNT

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return { positions }
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3] + Math.sin(t * 0.1 + i * 0.01) * 0.3
      const y = positions[i * 3 + 1] + Math.cos(t * 0.08 + i * 0.01) * 0.3
      const z = positions[i * 3 + 2]
      dummy.position.set(x, y, z)
      const scale = 0.02 + Math.sin(t * 0.5 + i) * 0.01
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
    </instancedMesh>
  )
}

function NebulaMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.z = clock.getElapsedTime() * 0.05
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.03
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <torusGeometry args={[4, 2, 16, 100]} />
      <meshBasicMaterial color="#7b00ff" transparent opacity={0.03} wireframe />
    </mesh>
  )
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
      >
        <AdaptiveDpr pixelated />
        <Particles />
        <NebulaMesh />
      </Canvas>
    </div>
  )
}
