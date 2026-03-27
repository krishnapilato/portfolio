import { useEffect } from 'react'
import { getGPUTier } from 'detect-gpu'
import { useGameStore, type PerformanceTier } from '../store/gameStore'

const tierMap: Record<number, PerformanceTier> = {
  1: 'potato',
  2: 'low',
  3: 'medium',
  4: 'high',
}

function PerformanceManager() {
  const setPerformanceTier = useGameStore((s) => s.setPerformanceTier)

  useEffect(() => {
    let mounted = true
    getGPUTier().then((tier) => {
      if (!mounted) return
      const mapped = tierMap[tier.tier] ?? 'medium'
      setPerformanceTier(mapped)
    })
    return () => {
      mounted = false
    }
  }, [setPerformanceTier])

  return null
}

export default PerformanceManager
