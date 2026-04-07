import { useState, useEffect } from 'react'

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

export default function CountdownTimer() {
  const [tl, setTl] = useState<TimeLeft>(calcTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTl(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const units: { label: string; value: number }[] = [
    { label: 'DAYS',    value: tl.days    },
    { label: 'HRS',     value: tl.hours   },
    { label: 'MIN',     value: tl.minutes },
    { label: 'SEC',     value: tl.seconds },
  ]

  return (
    <div className="countdown">
      {units.map(({ label, value }) => (
        <div key={label} className="countdown-unit">
          <span className="countdown-number">{pad(value)}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
