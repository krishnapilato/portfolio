import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlowTextProps {
  children: ReactNode
  className?: string
  glow?: boolean
  delay?: number
}

export function GlowText({ children, className, glow = false, delay = 0 }: GlowTextProps) {
  return (
    <motion.span
      className={cn('inline-block', glow && 'neon-glow', className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.span>
  )
}
