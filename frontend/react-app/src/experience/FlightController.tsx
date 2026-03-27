import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Euler, Group, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import type { InputState } from '../systems/useInput'
import { useGameStore } from '../store/gameStore'
import Airplane from './components/Airplane'

type FlightControllerProps = {
  worldRef: React.RefObject<Group | null>
  planeRef: React.RefObject<Group | null>
  input: InputState
  onPosition?: (worldPosition: Vector3) => void
}

const forwardBase = 18
const boostBonus = 14
const maxTilt = 0.45
const maxRoll = 0.55

function FlightController({ worldRef, planeRef, input, onPosition }: FlightControllerProps) {
  const velocity = useRef(new Vector3(0, 0, -forwardBase))
  const temp = useMemo(() => new Vector3(), [])

  const cinematicActive = useGameStore((s) => s.cinematicActive)
  const isFlying = useGameStore((s) => s.isFlying)
  const targetSpeed = useGameStore((s) => s.targetSpeed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const setTargetSpeed = useGameStore((s) => s.setTargetSpeed)
  const setWorldShift = useGameStore((s) => s.setWorldShift)

  // soft engine audio synthesized on the fly to avoid assets
  const audioRefs = useRef<{ ctx?: AudioContext; osc?: OscillatorNode; gain?: GainNode }>({})
  useEffect(() => {
    const handle = () => {
      if (audioRefs.current.ctx) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.value = 180
      gain.gain.value = 0.0001
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      audioRefs.current = { ctx, osc, gain }
    }
    window.addEventListener('pointerdown', handle, { once: true })
    return () => {
      window.removeEventListener('pointerdown', handle)
      audioRefs.current.osc?.stop()
      audioRefs.current.ctx?.close()
    }
  }, [])

  useFrame(({ camera }, delta) => {
    if (!planeRef.current) return
    const activeCamera = camera as PerspectiveCamera
    const active = !cinematicActive && isFlying
    const lerpFactor = MathUtils.clamp(delta * 4, 0, 1)

    const boost = active && input.boost
    const desiredTarget = forwardBase + (boost ? boostBonus : 6)
    const smoothTarget = MathUtils.lerp(targetSpeed, desiredTarget, lerpFactor * 0.5)
    setTargetSpeed(smoothTarget)

    const currentSpeed = velocity.current.length()
    const nextSpeed = MathUtils.lerp(currentSpeed, smoothTarget, lerpFactor * 0.8)
    velocity.current.setLength(nextSpeed)
    setSpeed(nextSpeed)

    // orientation
    const rot = planeRef.current.rotation
    const desiredPitch = active ? input.pitch * maxTilt : 0
    const desiredYaw = active ? input.yaw * maxTilt : 0
    const desiredRoll = active ? input.roll * maxRoll : 0

    rot.x = MathUtils.lerp(rot.x, desiredPitch, lerpFactor)
    rot.y = MathUtils.lerp(rot.y, desiredYaw * 0.7, lerpFactor)
    rot.z = MathUtils.lerp(rot.z, desiredRoll, lerpFactor)

    // move forward based on local orientation
    temp.set(0, 0, -1).applyEuler(new Euler(rot.x, rot.y, rot.z)).normalize()
    velocity.current.copy(temp.multiplyScalar(nextSpeed))
    planeRef.current.position.addScaledVector(velocity.current, delta)

    // recycle world to keep near origin
    const distance = planeRef.current.position.length()
    if (distance > 320) {
      const shift = planeRef.current.position.clone()
      planeRef.current.position.set(0, 0, 0)
      if (worldRef.current) {
        worldRef.current.position.sub(shift)
        setWorldShift(worldRef.current.position.clone())
      }
    }

    // reactive FOV
    activeCamera.fov = MathUtils.lerp(
      activeCamera.fov,
      60 + nextSpeed * 0.35,
      lerpFactor,
    )
    activeCamera.updateProjectionMatrix()

    audioRefs.current.osc?.frequency?.setTargetAtTime(80 + nextSpeed * 3, 0, 0.05)
    audioRefs.current.gain?.gain.setTargetAtTime(active ? 0.08 : 0.02, 0, 0.2)

    onPosition?.(planeRef.current.getWorldPosition(temp))
  })

  return (
    <group ref={planeRef} position={[0, 1.2, 12]}>
      <Airplane />
      <group position={[0, 0, -1.6]}>
        {[...Array(10)].map((_, i) => (
          <mesh key={i} position={[0, 0, -i * 0.4]}>
            <boxGeometry args={[0.08, 0.08, 0.14]} />
            <meshBasicMaterial
              color={new Color('#7dd3fc').offsetHSL(0, 0, i * -0.03)}
              transparent
              opacity={Math.max(0.08, 0.5 - i * 0.05)}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default FlightController
