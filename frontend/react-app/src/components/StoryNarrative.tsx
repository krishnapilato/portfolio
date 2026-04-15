import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useGameProgress } from '../hooks/useGameProgress'

const PANELS = [
  {
    chapter: 'Chapter 01',
    title: 'The First Compile',
    body: 'A 19-year-old Jok writes his first "Hello, World!" in Java. The compiler error says line 3. He stares for 20 minutes before adding a semicolon. The legend begins.',
    color: '#ff9f00',
  },
  {
    chapter: 'Chapter 02',
    title: 'Spring Awakening',
    body: 'Two years in, Jok discovers Spring Boot. REST endpoints materialize in minutes. He builds his first CRUD API in a weekend and forgets to sleep.',
    color: '#6db33f',
  },
  {
    chapter: 'Chapter 03',
    title: 'The Frontend Crossing',
    body: 'The backend wizard ventures into React land. State management, hooks, JSX — foreign runes at first. But the power of a full-stack mind begins to crystallize.',
    color: '#00f7ff',
  },
  {
    chapter: 'Chapter 04',
    title: 'The Microservice Wars',
    body: 'A monolith grown too large. Jok draws boundaries in the code, deploying Docker containers across Kubernetes clusters. Order restored. Architecture ascends.',
    color: '#ff00aa',
  },
  {
    chapter: 'Chapter 05',
    title: 'Level 42 Unlocked',
    body: 'The portfolio drops in 2026. Every project a boss battle won. Every commit a level gained. The odyssey continues — and you are here at the beginning.',
    color: '#aaff00',
  },
]

export function StoryNarrative() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollXProgress } = useScroll({ container: containerRef })
  const { progress } = useGameProgress()

  const progressBarWidth = useTransform(scrollXProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = () => progress(3)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [progress])

  return (
    <section id="story" className="relative py-20 overflow-hidden">
      <div className="text-center mb-12 px-6">
        <p className="text-[#00f7ff] text-xs font-mono tracking-[0.3em] uppercase mb-2">Origin Story</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          The Java Codex Chronicles
        </h2>
      </div>

      {/* Scroll progress indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{
          width: progressBarWidth,
          background: 'linear-gradient(90deg, #00f7ff, #ff00aa)',
        }}
      />

      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto px-8 pb-8 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {PANELS.map((panel, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex-shrink-0 w-72 md:w-80 snap-start rounded-2xl p-6 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${panel.color}33`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 40px ${panel.color}11`,
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: `0 0 60px ${panel.color}33`,
              borderColor: `${panel.color}88`,
            }}
          >
            <span
              className="text-xs font-mono uppercase tracking-widest block mb-3"
              style={{ color: panel.color }}
            >
              {panel.chapter}
            </span>
            <h3
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              {panel.title}
            </h3>
            <p className="text-[#aaa] text-sm leading-relaxed">{panel.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
