import { useCallback } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'

export function useGameProgress() {
  const addCodexProgress = usePortfolioStore((s) => s.addCodexProgress)
  const codexLevel = usePortfolioStore((s) => s.codexLevel)

  const progress = useCallback((amount: number) => {
    addCodexProgress(amount)
  }, [addCodexProgress])

  return { codexLevel, progress }
}
