import { useState } from 'react'
import type { Settings } from '../App'

interface Props {
  settings: Settings
  onSettingsChange: (s: Settings) => void
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="sp-row">
      <div className="sp-row-header">
        <span className="sp-label">{label}</span>
        <span className="sp-value">
          {value}
          {unit ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sp-slider"
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="sp-row sp-toggle-row">
      <span className="sp-label">{label}</span>
      <button
        className={`sp-toggle ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        type="button"
      >
        <span className="sp-thumb" />
      </button>
    </div>
  )
}

const THEMES: { key: Settings['colorTheme']; label: string }[] = [
  { key: 'cosmic', label: 'Cosmic' },
  { key: 'cyber',  label: 'Cyber'  },
  { key: 'void',   label: 'Void'   },
]

export default function SettingsPanel({ settings, onSettingsChange }: Props) {
  const [open, setOpen] = useState(false)

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className={`settings-panel ${open ? 'open' : ''}`}>
      {/* Toggle button */}
      <button
        className="sp-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close settings' : 'Open settings'}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span>SETTINGS</span>
      </button>

      {/* Panel */}
      <div className="sp-panel">
        <div className="sp-panel-inner">

          <div className="sp-section-title">TUNNEL</div>
          <Slider label="Speed"  value={settings.tunnelSpeed} min={0.1} max={3.0} step={0.1} onChange={(v) => set('tunnelSpeed', v)} />
          <Slider label="Rings"  value={settings.ringCount}   min={20}  max={80}  step={5}   onChange={(v) => set('ringCount', v)} />

          <div className="sp-section-title">EFFECTS</div>
          <Slider
            label="Bloom"
            value={settings.bloomIntensity}
            min={0}
            max={4}
            step={0.1}
            onChange={(v) => set('bloomIntensity', v)}
          />
          <Toggle
            label="Particles"
            checked={settings.showParticles}
            onChange={(v) => set('showParticles', v)}
          />
          {settings.showParticles && (
            <Slider
              label="Particle Count"
              value={settings.particleCount}
              min={100}
              max={2000}
              step={100}
              onChange={(v) => set('particleCount', v)}
            />
          )}

          <div className="sp-section-title">THEME</div>
          <div className="sp-theme-row">
            {THEMES.map(({ key, label }) => (
              <button
                key={key}
                className={`sp-theme-btn ${settings.colorTheme === key ? 'active' : ''}`}
                onClick={() => set('colorTheme', key)}
                type="button"
              >
                <span className={`sp-theme-dot ${key}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="sp-section-title">CINEMATIC</div>
          <Toggle
            label="Letterbox Bars"
            checked={settings.cinematicBars}
            onChange={(v) => set('cinematicBars', v)}
          />
        </div>
      </div>
    </div>
  )
}
