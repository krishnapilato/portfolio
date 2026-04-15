import { motion } from 'framer-motion'

const MILESTONES = [
  { date: 'Q1 2026', title: 'Portfolio Framework', desc: 'Core architecture laid. React 19, Three.js, Spring Boot microservices backbone.', color: '#00f7ff', done: false },
  { date: 'Q2 2026', title: 'Portfolio Drops 🚀', desc: 'Full portfolio goes live. 8+ projects showcased, case studies, live demos.', color: '#ff9f00', done: false },
  { date: 'Q2 2026', title: 'Spring Boot Microservices Live', desc: 'Production-grade REST APIs. Auth, notifications, analytics—all containerized.', color: '#6db33f', done: false },
  { date: 'Q3 2026', title: 'Open Source Release', desc: 'Core libraries and toolkits released. Community contributions welcome.', color: '#aaff00', done: false },
  { date: 'Q4 2026', title: 'Level 100 Achieved', desc: 'Codex complete. The odyssey continues to its next chapter.', color: '#ff00aa', done: false },
]

export function LaunchTimeline() {
  return (
    <section id="timeline" className="py-20 px-6 max-w-2xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[#ff9f00] text-xs font-mono tracking-[0.3em] uppercase mb-2">Quest Log</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          Launch Timeline
        </h2>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-[1px]"
          style={{ background: 'linear-gradient(180deg, #00f7ff, #ff00aa)' }}
        />

        <div className="flex flex-col gap-8 pl-12">
          {MILESTONES.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              className="relative"
            >
              {/* Dot */}
              <div
                className="absolute -left-[34px] top-1 w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: m.color,
                  background: m.done ? m.color : '#0a0a0a',
                  boxShadow: `0 0 12px ${m.color}88`,
                }}
              />
              <span
                className="text-xs font-mono uppercase tracking-widest block mb-1"
                style={{ color: m.color }}
              >
                {m.date}
              </span>
              <h3
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {m.title}
              </h3>
              <p className="text-[#666] text-sm leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
