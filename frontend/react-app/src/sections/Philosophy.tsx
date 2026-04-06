import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import content from '../data/content.json'

export function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center py-32 px-6 overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Large ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00f5ff, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-4xl w-full mx-auto">
        <motion.p
          className="text-xs tracking-[0.5em] uppercase text-[#00f5ff]/60 mb-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          05 — Philosophy
        </motion.p>

        <div className="space-y-8">
          {content.philosophy.statements.map((statement, i) => (
            <motion.div
              key={i}
              className="relative group cursor-default"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div className="flex items-center gap-6">
                <span className="text-[#00f5ff]/20 text-sm font-mono group-hover:text-[#00f5ff]/60 transition-colors duration-500">
                  0{i + 1}
                </span>
                <h3
                  className="text-4xl md:text-6xl font-bold text-white/80 group-hover:text-white transition-colors duration-500"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {statement}
                </h3>
              </div>
              <div className="h-px mt-6 bg-gradient-to-r from-white/5 to-transparent group-hover:from-[#00f5ff]/30 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
