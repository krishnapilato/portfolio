import { useRef, Suspense } from 'react'
import { motion, useInView } from 'framer-motion'
import { TechScene } from '../scenes/TechScene'
import content from '../data/content.json'

export function TechStack() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030310 0%, #000 100%)' }}
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <motion.p
          className="text-xs tracking-[0.5em] uppercase text-[#00f5ff]/60 mb-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          04 — Tech Stack
        </motion.p>

        <motion.h2
          className="text-5xl md:text-7xl font-bold text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          {content.techStack.headline}
        </motion.h2>

        <motion.p
          className="text-lg text-white/40 mb-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          The tools I use to build remarkable things.
        </motion.p>
      </div>

      {/* 3D Canvas */}
      <div className="w-full" style={{ height: '500px' }}>
        <Suspense fallback={null}>
          {isInView && <TechScene />}
        </Suspense>
      </div>

      {/* Tech grid labels */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {content.techStack.items.map((item, i) => (
            <motion.div
              key={item.name}
              className="text-center py-3 px-2 rounded-lg border border-white/5 bg-white/[0.02] group cursor-default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
              whileHover={{ borderColor: item.color, scale: 1.05 }}
            >
              <div
                className="text-xs font-semibold mb-1 transition-colors duration-300"
                style={{ color: item.color }}
              >
                {item.name}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">
                {item.category}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
