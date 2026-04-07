import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TARGET = new Date('2026-04-20T00:00:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET.getTime() - Date.now())
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function AnimatedNumber({ value }: { value: number }) {
  const padded = pad(value)
  return (
    <div className="countdown-number">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={padded}
          initial={{ y: 25, opacity: 0, filter: 'blur(4px)', scale: 0.95 }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ y: -25, opacity: 0, filter: 'blur(4px)', scale: 1.05 }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 24,
            mass: 1.5,
          }}
        >
          {padded}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export default function CountdownTimer() {
  const [tl, setTl] = useState<TimeLeft>(calcTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTl(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const units: { label: string; value: number }[] = [
    { label: 'DAYS',    value: tl.days    },
    { label: 'HOURS',   value: tl.hours   },
    { label: 'MINUTES', value: tl.minutes },
    { label: 'SECONDS', value: tl.seconds },
  ]

  return (
    <div className="countdown">
      {units.map(({ label, value }) => (
        <div key={label} className="countdown-unit">
          <AnimatedNumber value={value} />
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
