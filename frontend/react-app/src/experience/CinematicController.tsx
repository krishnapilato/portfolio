import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { Group, PerspectiveCamera, Vector3, Object3D } from 'three'
import { useGameStore, type ZoneId } from '../store/gameStore'
import { getZoneVector } from './zones'

type CinematicControllerProps = {
  planeRef: React.RefObject<Object3D | null>
  worldRef: React.RefObject<Group | null>
}

const warpOffset = new Vector3(0, 2, 18)

function CinematicController({ planeRef, worldRef }: CinematicControllerProps) {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const setCinematic = useGameStore((s) => s.setCinematic)
  const setFlight = useGameStore((s) => s.setFlight)
  const setZone = useGameStore((s) => s.setZone)
  const lookTarget = useRef(new Vector3())

  // Intro fly-in
  useEffect(() => {
    if (!planeRef.current) return
    setCinematic(true, 'cinematic')
    setFlight(false)

    const fromPos = camera.position.clone().add(new Vector3(0, 14, 30))
    camera.position.copy(fromPos)
    camera.lookAt(planeRef.current.position)

    const timeline = gsap.timeline({
      defaults: { duration: 1.6, ease: 'power2.inOut' },
      onComplete: () => {
        setCinematic(false, 'follow')
        setFlight(true)
      },
    })
    timeline.to(camera.position, { x: 6, y: 4, z: 12 }, 0)
    timeline.to(camera.position, { x: 0.6, y: 1.9, z: 6.2 }, 0.9)
    timeline.to(camera.rotation, { x: -0.04, y: 0.05, z: 0 }, 0.2)

    return () => {
      timeline.kill()
    }
  }, [camera, planeRef, setCinematic, setFlight])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ zoneId: ZoneId }>).detail
      const zoneId = detail?.zoneId
      if (!zoneId || !planeRef.current || !worldRef.current) return

      const zoneTarget = getZoneVector(zoneId)
      const desiredOffset = zoneTarget.clone().negate().add(warpOffset)

      setCinematic(true, 'cinematic')
      setFlight(false)

      const timeline = gsap.timeline({
        defaults: { duration: 1.2, ease: 'power3.inOut' },
        onComplete: () => {
          worldRef.current?.position.copy(desiredOffset)
          planeRef.current?.position.set(0, 0, 0)
          setZone(zoneId)
          setFlight(true)
          setCinematic(false, 'follow')
          camera.fov = 60
          camera.updateProjectionMatrix()
        },
      })

      timeline
        .to(camera.position, { z: '-=14', y: '+=2' }, 0)
        .to(camera, { fov: 25, onUpdate: () => camera.updateProjectionMatrix() }, 0)
        .to(worldRef.current.position, desiredOffset, 0.2)

      timeline.eventCallback('onUpdate', () => {
        if (!planeRef.current) return
        camera.lookAt(planeRef.current.getWorldPosition(lookTarget.current))
      })
    }

    window.addEventListener('warp-to-zone', handler as EventListener)
    return () => window.removeEventListener('warp-to-zone', handler as EventListener)
  }, [camera, planeRef, setCinematic, setFlight, setZone, worldRef])

  return null
}

export default CinematicController
