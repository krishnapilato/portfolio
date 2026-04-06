import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { HeroScene } from '../scenes/HeroScene'
import { ScrollIndicator } from '../components/ui/ScrollIndicator'
import content from '../data/content.json'

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!nameRef.current) return
    gsap.from(nameRef.current, {
      opacity: 0,
      y: 60,
      duration: 1.4,
      ease: 'power4.out',
      delay: 0.5,
    })
  }, [])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      <HeroScene />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,245,255,0.05),transparent)] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.p
          className="text-sm tracking-[0.4em] uppercase text-white/40 mb-6 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {content.hero.greeting}
        </motion.p>

        <h1
          ref={nameRef}
          className="text-7xl md:text-9xl font-bold tracking-tight text-white leading-none mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {content.hero.name}
        </h1>

        <motion.p
          className="text-xl md:text-2xl text-white/60 font-light tracking-wide mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {content.hero.tagline}
        </motion.p>

        <motion.p
          className="text-base md:text-lg text-white/30 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          {content.hero.subtitle}
        </motion.p>

        {/* Neon line accent */}
        <motion.div
          className="w-24 h-px bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent mx-auto mt-12"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
        />
      </div>

      <ScrollIndicator />
    </section>
  )
}
