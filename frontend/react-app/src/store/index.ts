import { create } from 'zustand'

type GPUTier = 'high' | 'medium' | 'low'

interface PortfolioStore {
  scrollProgress: number
  currentScene: number
  gpuTier: GPUTier
  isLoaded: boolean
  setScrollProgress: (p: number) => void
  setCurrentScene: (s: number) => void
  setGpuTier: (t: GPUTier) => void
  setIsLoaded: (l: boolean) => void
}

export const useStore = create<PortfolioStore>((set) => ({
  scrollProgress: 0,
  currentScene: 0,
  gpuTier: 'high',
  isLoaded: false,
  setScrollProgress: (p) => set({ scrollProgress: p }),
  setCurrentScene: (s) => set({ currentScene: s }),
  setGpuTier: (t) => set({ gpuTier: t }),
  setIsLoaded: (l) => set({ isLoaded: l }),
}))
