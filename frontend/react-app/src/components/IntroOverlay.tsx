import { motion } from 'framer-motion'
import CountdownTimer from './CountdownTimer'

interface Props {
  cinematicBars: boolean
}

// Cinematic letter reveal
function SplitText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: delay + i * 0.045,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
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

      {/* ── Main glass card ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        {/* Sub-title / first name */}
        <div className="name-first">
          <SplitText text="KHOVA" delay={1.8} className="name-first-text" />
        </div>

        {/* Primary name */}
        <h1 className="name-main">
          <SplitText text="KRISHNA" delay={2.1} className="name-word" />
          {' '}
          <SplitText text="PILATO" delay={2.5} className="name-word accent" />
        </h1>

        {/* Role */}
        <motion.p
          className="role-text"
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.35em' }}
          transition={{ delay: 3.1, duration: 0.9, ease: 'easeOut' }}
        >
          Software Engineer · AI &amp; Vision · Creative Dev
        </motion.p>

        {/* Separator */}
        <motion.div
          className="separator"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 3.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Coming Soon section */}
        <motion.div
          className="coming-soon"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="coming-soon-label">COMING SOON</span>
          <span className="coming-soon-date">20 · APRIL · 2026</span>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <CountdownTimer />
        </motion.div>
      </motion.div>

      {/* ── Bottom caption ── */}
      <motion.div
        className="bottom-caption"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.0, duration: 1.0 }}
      >
        Portfolio · 2026
      </motion.div>
    </div>
  )
}
