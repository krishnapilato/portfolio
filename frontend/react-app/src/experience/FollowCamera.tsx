import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, Vector3, type Object3D } from 'three'
import { useGameStore } from '../store/gameStore'

type FollowCameraProps = {
  targetRef: React.RefObject<Object3D | null>
}

const tmp = new Vector3()
const lookAt = new Vector3()

function FollowCamera({ targetRef }: FollowCameraProps) {
  const { camera } = useThree()
  const offset = useRef(new Vector3(0, 2.2, 8))
  const cinematicActive = useGameStore((s) => s.cinematicActive)
  const cameraMode = useGameStore((s) => s.cameraMode)

  useFrame((_, delta) => {
    if (!targetRef.current || cinematicActive) return
    const targetPos = targetRef.current.getWorldPosition(tmp)
    const desired = targetPos.clone().add(offset.current)
    camera.position.lerp(desired, MathUtils.clamp(delta * 2.8, 0, 1))
    lookAt.lerp(targetPos, MathUtils.clamp(delta * 4.2, 0, 1))
    camera.lookAt(lookAt)

    if (cameraMode === 'follow') return
    if (cameraMode === 'focus') {
      const closer = targetPos.clone().addScaledVector(offset.current, 0.45)
      camera.position.lerp(closer, MathUtils.clamp(delta * 2.2, 0, 1))
      camera.lookAt(targetPos)
    }
  })

  return null
}

export default FollowCamera
