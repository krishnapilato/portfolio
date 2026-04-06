import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { GraphScene } from '../scenes/GraphScene'
import content from '../data/content.json'

export function SystemThinking() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, margin: '-20%' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-32 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #030310 100%)' }}
    >
      {/* Stars bg */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (((i * 7) % 20) / 10 + 1) + 'px',
              height: (((i * 7) % 20) / 10 + 1) + 'px',
              top: ((i * 13) % 100) + '%',
              left: ((i * 17) % 100) + '%',
              opacity: ((i * 11) % 30) / 100 + 0.05,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <motion.p
          className="text-xs tracking-[0.5em] uppercase text-[#00f5ff]/60 mb-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          03 — System Thinking
        </motion.p>

        <motion.h2
          className="text-5xl md:text-7xl font-bold text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          {content.systemThinking.headline}
        </motion.h2>

        <motion.p
          className="text-lg text-white/40 max-w-xl mb-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {content.systemThinking.description}
        </motion.p>

        {/* Graph */}
        <motion.div
          className="w-full"
          style={{ height: '400px' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <GraphScene isVisible={isInView} />
        </motion.div>
      </div>
    </section>
  )
}
