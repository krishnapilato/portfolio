import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { PortfolioScene } from '../scenes/PortfolioScene'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { useGameProgress } from '../hooks/useGameProgress'

const TYPEWRITER_TEXT =
  'In the neon-lit servers of Milan… a full-stack legend is forging the ultimate portfolio. Java. Spring. React 19. The adventure begins.'

export function Hero3D() {
  const [typed, setTyped] = useState('')
  const [charIndex, setCharIndex] = useState(0)
  const modalOpen = usePortfolioStore((s) => s.modalOpen)
  const activeSkill = usePortfolioStore((s) => s.activeSkill)
  const closeSkillModal = usePortfolioStore((s) => s.closeSkillModal)
  const { progress } = useGameProgress()

  useEffect(() => {
    if (charIndex < TYPEWRITER_TEXT.length) {
      const id = setTimeout(() => {
        setTyped((prev) => prev + TYPEWRITER_TEXT[charIndex])
        setCharIndex((prev) => prev + 1)
      }, 28)
      return () => clearTimeout(id)
    }
  }, [charIndex])

  useEffect(() => {
    progress(5)
  }, [progress])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Three.js Canvas */}
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 2, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0a' }}
      >
        <PortfolioScene />
      </Canvas>

      {/* Overlay headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center px-4"
        >
          <p className="text-[#00f7ff] text-sm font-mono tracking-[0.3em] uppercase mb-3 opacity-80">
            THE CODEX IS LOADING...
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", color: '#fff', textShadow: '0 0 40px #ff9f0088' }}
          >
            JOK DAS
          </h1>
          <p className="text-xl md:text-2xl text-[#ff9f00] font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            JAVA FULL STACK ODYSSEY
          </p>
          <p className="text-sm text-[#aaa] tracking-widest uppercase mb-6">
            Coming 2026 · Level 42 Developer
          </p>
          <p className="max-w-lg mx-auto text-[#ccc] text-sm leading-relaxed font-mono min-h-[3rem]">
            {typed}
            <span className="animate-pulse text-[#00f7ff]">|</span>
          </p>
        </motion.div>
      </div>

      {/* Skill Modal */}
      {modalOpen && activeSkill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }}
          onClick={closeSkillModal}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative max-w-md w-full mx-4 rounded-2xl p-8"
            style={{
              background: 'rgba(10,10,10,0.95)',
              border: `1px solid ${activeSkill.color}55`,
              boxShadow: `0 0 60px ${activeSkill.color}33, 0 0 120px ${activeSkill.color}11`,
              pointerEvents: 'all',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="inline-block text-xs font-mono px-3 py-1 rounded-full mb-4 uppercase tracking-widest"
              style={{ background: `${activeSkill.color}22`, color: activeSkill.color, border: `1px solid ${activeSkill.color}44` }}
            >
              {activeSkill.description}
            </div>
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: activeSkill.color, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              {activeSkill.label}
            </h2>
            <p className="text-[#ccc] leading-relaxed text-sm mb-6">{activeSkill.lore}</p>
            <button
              onClick={closeSkillModal}
              className="text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
              style={{ background: `${activeSkill.color}22`, color: activeSkill.color, border: `1px solid ${activeSkill.color}55` }}
            >
              ← Close Codex Entry
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
