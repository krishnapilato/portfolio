import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import TunnelScene from './scenes/TunnelScene'
import type { TunnelSettings, ColorTheme } from './scenes/TunnelScene'
import IntroOverlay from './components/IntroOverlay'
import SettingsPanel from './components/SettingsPanel'

export interface Settings extends TunnelSettings {
  cinematicBars: boolean
  colorTheme: ColorTheme
}

const DEFAULT_SETTINGS: Settings = {
  tunnelSpeed: 1.0,
  ringCount: 40,
  bloomIntensity: 1.5,
  showParticles: true,
  particleCount: 600,
  colorTheme: 'cosmic',
  cinematicBars: true,
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  return (
    <div className="app-root">
      {/* ── Full-screen 3D canvas ── */}
      <Canvas
        className="canvas-root"
        camera={{ fov: 75, near: 0.1, far: 500, position: [0, 0, 5] }}
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <TunnelScene settings={settings} />
        </Suspense>
      </Canvas>

      {/* ── Glassmorphic overlay ── */}
      <IntroOverlay cinematicBars={settings.cinematicBars} />

      {/* ── Settings panel ── */}
      <SettingsPanel settings={settings} onSettingsChange={setSettings} />
    </div>
  )
}
