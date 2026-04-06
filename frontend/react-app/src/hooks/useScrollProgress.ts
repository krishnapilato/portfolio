import { useEffect } from 'react'
import { useStore } from '../store'

export function useScrollProgress() {
  const setScrollProgress = useStore((s) => s.setScrollProgress)
  const setCurrentScene = useStore((s) => s.setCurrentScene)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(progress)
      // 7 scenes
      const scene = Math.floor(progress * 7)
      setCurrentScene(Math.min(scene, 6))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollProgress, setCurrentScene])
}
