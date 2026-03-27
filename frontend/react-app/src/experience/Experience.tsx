import { Suspense, useRef } from 'react'
import { Environment } from '@react-three/drei'
import { type Group, Vector3 } from 'three'
import FlightController from './FlightController'
import FollowCamera from './FollowCamera'
import GalaxySystem from './GalaxySystem'
import ZoneManager from './ZoneManager'
import CinematicController from './CinematicController'
import { type InputState } from '../systems/useInput'

type ExperienceProps = {
  input: InputState
}

function Experience({ input }: ExperienceProps) {
  const planeRef = useRef<Group | null>(null)
  const worldRef = useRef<Group | null>(null)
  const lastPos = useRef(new Vector3())

  return (
    <>
      <color attach="background" args={['#04060f']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 14, 8]} intensity={2.2} castShadow />
      <pointLight position={[-12, 10, -10]} intensity={0.8} color="#60a5fa" />
      <Suspense fallback={null}>
        <group ref={worldRef}>
          <GalaxySystem />
          <ZoneManager planeRef={planeRef} />
        </group>
        <FlightController
          worldRef={worldRef}
          planeRef={planeRef}
          input={input}
          onPosition={(pos) => lastPos.current.copy(pos)}
        />
        <FollowCamera targetRef={planeRef} />
        <CinematicController planeRef={planeRef} worldRef={worldRef} />
        <Environment preset="city" />
      </Suspense>
    </>
  )
}

export default Experience
