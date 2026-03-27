import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type InputState = {
  pitch: number
  yaw: number
  roll: number
  boost: boolean
  action: boolean
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function useInput(enabled: boolean) {
  const [input, setInput] = useState<InputState>({
    pitch: 0,
    yaw: 0,
    roll: 0,
    boost: false,
    action: false,
  })

  const joystick = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return

    const handleKey = (next: Partial<InputState>) =>
      setInput((prev) => ({ ...prev, ...next }))

    const down = (e: KeyboardEvent) => {
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) e.preventDefault()
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          handleKey({ pitch: 1 })
          break
        case 'KeyS':
        case 'ArrowDown':
          handleKey({ pitch: -1 })
          break
        case 'KeyA':
        case 'ArrowLeft':
          handleKey({ yaw: 1, roll: 0.6 })
          break
        case 'KeyD':
        case 'ArrowRight':
          handleKey({ yaw: -1, roll: -0.6 })
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          handleKey({ boost: true })
          break
        case 'Space':
        case 'Enter':
          handleKey({ action: true })
          break
        default:
          break
      }
    }

    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'KeyS':
        case 'ArrowDown':
          handleKey({ pitch: 0 })
          break
        case 'KeyA':
        case 'ArrowLeft':
        case 'KeyD':
        case 'ArrowRight':
          handleKey({ yaw: 0, roll: 0 })
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          handleKey({ boost: false })
          break
        case 'Space':
        case 'Enter':
          handleKey({ action: false })
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [enabled])

  const updateJoystick = useCallback(
    (x: number, y: number) => {
      joystick.current = { x, y }
      if (!enabled) return
      setInput((prev) => ({
        ...prev,
        pitch: clamp(y, -1, 1),
        yaw: clamp(-x, -1, 1),
        roll: clamp(-x * 0.8, -1, 1),
      }))
    },
    [enabled],
  )

  const resetJoystick = useCallback(() => updateJoystick(0, 0), [updateJoystick])

  return useMemo(
    () => ({
      input: enabled
        ? input
        : { pitch: 0, yaw: 0, roll: 0, boost: false, action: false },
      updateJoystick,
      resetJoystick,
    }),
    [enabled, input, resetJoystick, updateJoystick],
  )
}
