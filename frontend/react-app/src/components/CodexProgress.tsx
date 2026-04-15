import { motion } from 'framer-motion'
import { usePortfolioStore } from '../store/usePortfolioStore'

export function CodexProgress() {
  const codexLevel = usePortfolioStore((s) => s.codexLevel)

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-30"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2 }}
    >
      <div
        className="rounded-2xl p-4 min-w-[140px]"
        style={{
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid rgba(0,247,255,0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <p className="text-[#00f7ff] text-xs font-mono uppercase tracking-widest mb-2">Codex Level</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#111] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00f7ff, #ff00aa)' }}
              animate={{ width: `${codexLevel}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
          <span className="text-white text-xs font-mono font-bold">{codexLevel}%</span>
        </div>
      </div>
    </motion.div>
  )
}
