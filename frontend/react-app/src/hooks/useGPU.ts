import { useEffect } from 'react'
import { getGPUTier } from 'detect-gpu'
import { useStore } from '../store'

export function useGPU() {
  const setGpuTier = useStore((s) => s.setGpuTier)

  useEffect(() => {
    getGPUTier().then((tier) => {
      if (tier.tier >= 3) setGpuTier('high')
      else if (tier.tier >= 2) setGpuTier('medium')
      else setGpuTier('low')
    }).catch(() => setGpuTier('medium'))
  }, [setGpuTier])
}
