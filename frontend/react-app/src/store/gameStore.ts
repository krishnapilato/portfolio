import { Vector3 } from 'three'
import { create } from 'zustand'

export type ZoneId = 'projects' | 'experience' | 'skills' | 'contact' | 'none'

type CameraMode = 'follow' | 'focus' | 'orbit' | 'cinematic'

export type PerformanceTier = 'high' | 'medium' | 'low' | 'potato'

type GameState = {
  currentZone: ZoneId
  unlockedZones: ZoneId[]
  isFlying: boolean
  cinematicActive: boolean
  speed: number
  targetSpeed: number
  performanceTier: PerformanceTier
  cameraMode: CameraMode
  worldShift: Vector3
  setZone: (zone: ZoneId) => void
  unlockZone: (zone: ZoneId) => void
  setCinematic: (active: boolean, mode?: CameraMode) => void
  setSpeed: (speed: number) => void
  setTargetSpeed: (speed: number) => void
  setPerformanceTier: (tier: PerformanceTier) => void
  setWorldShift: (shift: Vector3) => void
  setFlight: (flying: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  currentZone: 'none',
  unlockedZones: ['projects'],
  isFlying: true,
  cinematicActive: false,
  speed: 18,
  targetSpeed: 22,
  performanceTier: 'high',
  cameraMode: 'follow',
  worldShift: new Vector3(),
  setZone: (zone) => set({ currentZone: zone }),
  unlockZone: (zone) =>
    set((state) =>
      state.unlockedZones.includes(zone)
        ? state
        : { unlockedZones: [...state.unlockedZones, zone] },
    ),
  setCinematic: (active, mode) =>
    set((state) => ({ cinematicActive: active, cameraMode: mode ?? state.cameraMode })),
  setSpeed: (speed) => set({ speed }),
  setTargetSpeed: (targetSpeed) => set({ targetSpeed }),
  setPerformanceTier: (performanceTier) => set({ performanceTier }),
  setWorldShift: (worldShift) => set({ worldShift }),
  setFlight: (isFlying) => set({ isFlying }),
}))
