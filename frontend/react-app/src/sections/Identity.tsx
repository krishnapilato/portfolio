import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import content from '../data/content.json'

gsap.registerPlugin(ScrollTrigger)

export function Identity() {
  const sectionRef = useRef<HTMLElement>(null)
  const wordsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-20%' })

  useEffect(() => {
    if (!wordsRef.current || !sectionRef.current) return

    const words = wordsRef.current.querySelectorAll('.word-item')

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 30%',
        toggleActions: 'play none none reverse',
      }
    })

    tl.from(words, {
      opacity: 0,
      y: 80,
      rotateX: -45,
      stagger: 0.12,
      duration: 1,
      ease: 'power4.out',
    })

    return () => { tl.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center py-32 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #050508 100%)' }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl w-full mx-auto">
        <motion.p
          className="text-xs tracking-[0.5em] uppercase text-[#00f5ff]/60 mb-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          01 — Identity
        </motion.p>

        <p className="text-3xl md:text-4xl font-light text-white/50 mb-6">
          {content.identity.headline}
        </p>

        <div ref={wordsRef} className="overflow-hidden">
          {content.identity.words.map((word, i) => (
            <span
              key={i}
              className="word-item inline-block mr-4 text-5xl md:text-7xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {word}
              {i < content.identity.words.length - 1 && (
                <span className="text-[#00f5ff] mx-2">·</span>
              )}
            </span>
          ))}
        </div>

        <motion.p
          className="mt-12 text-lg text-white/50 max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {content.identity.description}
        </motion.p>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
          {content.identity.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.15 }}
            >
              <div
                className="text-4xl font-bold text-[#00f5ff] neon-glow"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/40 mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
