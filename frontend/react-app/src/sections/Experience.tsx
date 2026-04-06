import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import content from '../data/content.json'

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center py-32 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050508 0%, #000 100%)' }}
    >
      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-96 opacity-10"
        style={{
          background: 'linear-gradient(transparent, rgba(0,245,255,0.05))',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,245,255,0.3) 0, rgba(0,245,255,0.3) 1px, transparent 0, transparent 50%)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-6xl w-full mx-auto">
        <motion.p
          className="text-xs tracking-[0.5em] uppercase text-[#00f5ff]/60 mb-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          02 — Experience
        </motion.p>

        <motion.h2
          className="text-5xl md:text-7xl font-bold text-white mb-20"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          Where I've been.
        </motion.h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#00f5ff]/60 via-[#7b00ff]/40 to-transparent" />

          {content.experience.map((item, i) => (
            <motion.div
              key={i}
              className="relative pl-10 mb-20 last:mb-0"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.2 }}
            >
              {/* Dot on timeline */}
              <div
                className="absolute left-[-4px] top-2 w-2 h-2 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 12px ${item.color}` }}
              />

              {/* Card */}
              <div
                className="relative p-6 rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-white/10 transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                }}
              >
                <div
                  className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                />

                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                  <div>
                    <h3
                      className="text-2xl font-semibold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {item.role}
                    </h3>
                    <p className="text-base font-medium mt-1" style={{ color: item.color }}>
                      {item.company}
                    </p>
                  </div>
                  <p className="text-sm text-white/30 mt-2 md:mt-0 tracking-wider">
                    {item.period}
                  </p>
                </div>

                <p className="text-white/50 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
