import React, { useEffect, useMemo, useState } from 'react'
import type { ZoneId } from '../store/gameStore'
import { ZONES } from '../experience/zones'

type HUDProps = {
  speedProvider: () => number
  zoneProvider: () => ZoneId
  updateJoystick: (x: number, y: number) => void
  resetJoystick: () => void
}

const formatSpeed = (speed: number) => `${speed.toFixed(1)} u/s`

function HUD({ speedProvider, zoneProvider, updateJoystick, resetJoystick }: HUDProps) {
  const [speed, setSpeed] = useState(0)
  const [zone, setZone] = useState<ZoneId>('none')
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [joystickActive, setJoystickActive] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSpeed(speedProvider())
      setZone(zoneProvider())
    }, 80)
    return () => window.clearInterval(id)
  }, [speedProvider, zoneProvider])

  const handleWarp = (zoneId: ZoneId) => {
    window.dispatchEvent(new CustomEvent('warp-to-zone', { detail: { zoneId } }))
  }

  const activeZoneLabel = useMemo(
    () => ZONES.find((z) => z.id === zone)?.label ?? 'Free Flight',
    [zone],
  )

  const updateJoystickPosition = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    const clampedX = Math.max(-1, Math.min(1, x))
    const clampedY = Math.max(-1, Math.min(1, y))
    setJoystickPos({ x: clampedX, y: clampedY })
    updateJoystick(clampedX, clampedY)
  }

  const startJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
    setJoystickActive(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    updateJoystickPosition(e)
  }

  const moveJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickActive) return
    updateJoystickPosition(e)
  }

  const endJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
    setJoystickActive(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setJoystickPos({ x: 0, y: 0 })
    resetJoystick()
  }

  return (
    <div className="hud-shell">
      <div className="hud-top">
        <div className="hud-row">
          <div className="hud-panel">
            <strong>Velocity</strong>
            <div className="value">{formatSpeed(speed)}</div>
          </div>
          <div className="hud-panel">
            <strong>Zone</strong>
            <div className="value">{activeZoneLabel}</div>
          </div>
          <div className="hud-panel">
            <strong>Status</strong>
            <div className="status-badge">
              <span className="status-dot glow" />
              Flight Systems Stable
            </div>
          </div>
        </div>
        <div className="hud-panel">
          <strong>Legend</strong>
          <div className="legend">
            {ZONES.map((z) => (
              <div key={z.id} className="legend-item">
                <span className="legend-swatch" style={{ background: z.accent }} />
                {z.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hud-bottom">
        <div
          className="touch-joystick"
          onPointerMove={moveJoystick}
          onPointerDown={startJoystick}
          onPointerUp={endJoystick}
          onPointerLeave={endJoystick}
        >
          <div
            className="joystick-thumb"
            style={{
              transform: `translate(${joystickPos.x * 30}px, ${joystickPos.y * 30}px)`,
            }}
          />
        </div>

        <div className="hud-row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {ZONES.map((z) => (
            <button key={z.id} className="cta-button" onClick={() => handleWarp(z.id)}>
              Warp to {z.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HUD
