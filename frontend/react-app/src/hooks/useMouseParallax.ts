import { useEffect, useRef } from 'react'

export interface MouseParallax {
  x: number
  y: number
}

export function useMouseParallax() {
  const ref = useRef<MouseParallax>({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      ref.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return ref
}
