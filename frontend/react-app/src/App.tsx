import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import TunnelScene from './scenes/TunnelScene'
import type { TunnelSettings, ColorTheme } from './scenes/TunnelScene'
import IntroOverlay from './components/IntroOverlay'

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

const THEMES: ColorTheme[] = ['cosmic', 'cyber', 'void']

function ThemeToggle({ theme, onChange }: { theme: ColorTheme; onChange: (t: ColorTheme) => void }) {
  const handleCycle = () => {
    const nextIdx = (THEMES.indexOf(theme) + 1) % THEMES.length
    onChange(THEMES[nextIdx])
  }

  return (
    <button className="theme-toggle" onClick={handleCycle} type="button">
      <div className={`theme-toggle-dot ${theme}`} />
      <div className="theme-toggle-label">
        <span>Theme:</span>
        <span className="theme-toggle-val">{theme}</span>
      </div>
    </button>
  )
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

      {/* ── Minimal Theme Toggle ── */}
      <ThemeToggle 
        theme={settings.colorTheme} 
        onChange={(theme) => setSettings(s => ({ ...s, colorTheme: theme }))} 
      />
    </div>
  )
}
