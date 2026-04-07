import { motion } from 'framer-motion'
import CountdownTimer from './CountdownTimer'

interface Props {
  cinematicBars: boolean
}

export default function IntroOverlay({ cinematicBars }: Props) {
  return (
    <div className="overlay">
      {/* ── Cinematic letterbox bars ── */}
      {cinematicBars && (
        <>
          <motion.div
            className="letterbox top"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="letterbox bottom"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          />
        </>
      )}

      {/* ── Corner brackets (HUD) ── */}
      <motion.div
        className="corner-bracket tl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      />
      <motion.div
        className="corner-bracket tr"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      />
      <motion.div
        className="corner-bracket bl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      />
      <motion.div
        className="corner-bracket br"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      />

      {/* ── Scan line sweep ── */}
      <motion.div
        className="scan-line"
        initial={{ top: '0%', opacity: 0.6 }}
        animate={{ top: '100%', opacity: 0 }}
        transition={{ delay: 1.2, duration: 1.0, ease: 'linear' }}
      />

      {/* ── Main content container (No Card) ── */}
      <motion.div
        className="content-container minimal-countdown"
        initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        transition={{ delay: 1.8, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <CountdownTimer />
      </motion.div>
    </div>
  )
}
