import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import content from '../data/content.json'

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(0,245,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Animated border ring */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border border-[#00f5ff]/10"
        animate={isInView ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.1, 0.3],
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full border border-[#7b00ff]/10"
        animate={isInView ? {
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.05, 0.2],
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.p
          className="text-xs tracking-[0.5em] uppercase text-[#00f5ff]/60 mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          06 — Let's Work
        </motion.p>

        <motion.h2
          className="text-6xl md:text-8xl font-bold text-white leading-none mb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {content.cta.headline}
        </motion.h2>

        <motion.h2
          className="text-6xl md:text-8xl font-bold leading-none mb-12 neon-glow"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#00f5ff',
          }}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {content.cta.subheadline}
        </motion.h2>

        <motion.p
          className="text-lg text-white/40 mb-16 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {content.cta.description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a
            href={`mailto:${content.cta.email}`}
            className="group relative px-8 py-4 text-sm font-semibold tracking-widest uppercase text-black bg-[#00f5ff] rounded-sm hover:bg-white transition-colors duration-300 overflow-hidden"
          >
            <span className="relative z-10">Send a Message</span>
          </a>

          <a
            href={content.cta.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 text-sm font-semibold tracking-widest uppercase text-white/60 border border-white/10 rounded-sm hover:text-white hover:border-white/30 transition-all duration-300"
          >
            GitHub
          </a>

          <a
            href={content.cta.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 text-sm font-semibold tracking-widest uppercase text-white/60 border border-white/10 rounded-sm hover:text-[#00f5ff] hover:border-[#00f5ff]/30 transition-all duration-300"
          >
            LinkedIn
          </a>
        </motion.div>

        <motion.p
          className="text-white/20 text-sm mt-20 tracking-widest"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
        >
          © 2024 Krishna Pilato
        </motion.p>
      </div>
    </section>
  )
}
