import { motion } from 'framer-motion'

export function ScrollIndicator() {
  return (
    <motion.div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <span className="text-xs tracking-[0.3em] uppercase text-white/30 font-light">Scroll</span>
      <motion.div
        className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"
        animate={{ scaleY: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
