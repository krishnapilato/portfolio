import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback } from 'react'
import Experience from './experience/Experience'
import HUD from './ui/HUD'
import PerformanceManager from './systems/PerformanceManager'
import { useInput } from './systems/useInput'
import { useGameStore } from './store/gameStore'
import './App.css'

function App() {
  const cinematicActive = useGameStore((s) => s.cinematicActive)
  const input = useInput(!cinematicActive)
  const speedProvider = useCallback(() => useGameStore.getState().speed, [])
  const zoneProvider = useCallback(() => useGameStore.getState().currentZone, [])

  return (
    <div className="app-shell">
      <PerformanceManager />
      <Canvas
        className="app-canvas"
        shadows
        dpr={[0.75, 1.75]}
        camera={{ position: [0, 2.5, 10], fov: 60 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#04060f']} />
          <fog attach="fog" args={['#04060f', 60, 260]} />
          <Experience input={input.input} />
        </Suspense>
      </Canvas>
      <HUD
        speedProvider={speedProvider}
        zoneProvider={zoneProvider}
        updateJoystick={input.updateJoystick}
        resetJoystick={input.resetJoystick}
      />
    </div>
  )
}

export default App
