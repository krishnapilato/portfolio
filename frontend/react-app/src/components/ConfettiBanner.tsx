import { motion, AnimatePresence } from 'framer-motion'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { useEffect, useRef } from 'react'

export function ConfettiBanner() {
  const confettiTriggered = usePortfolioStore((s) => s.confettiTriggered)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!confettiTriggered || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = []
    const colors = ['#00f7ff', '#ff00aa', '#aaff00', '#ff9f00', '#fff']

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#fff',
        size: Math.random() * 6 + 2,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.y > canvas.height) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    const timeout = setTimeout(() => cancelAnimationFrame(animId), 5000)
    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(timeout)
    }
  }, [confettiTriggered])

  return (
    <AnimatePresence>
      {confettiTriggered && (
        <>
          <canvas
            ref={canvasRef}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-center px-8 py-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,159,0,0.2), rgba(255,0,170,0.2))',
              border: '1px solid rgba(255,159,0,0.5)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 60px rgba(255,159,0,0.3)',
            }}
          >
            <p className="text-[#ff9f00] font-bold text-lg" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              🏆 PORTFOLIO LAUNCHING SOON
            </p>
            <p className="text-[#aaa] text-sm mt-1 font-mono">Codex 100% — The legend is ready.</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
