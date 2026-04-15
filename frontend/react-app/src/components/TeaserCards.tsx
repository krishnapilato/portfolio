import { motion } from 'framer-motion'
import { Code2, Server, Database, Box, Globe, Layers, Cpu } from 'lucide-react'
import { SKILL_CARDS, usePortfolioStore } from '../store/usePortfolioStore'
import { useGameProgress } from '../hooks/useGameProgress'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  java: Cpu,
  spring: Server,
  react: Globe,
  postgres: Database,
  docker: Box,
  k8s: Layers,
  microservices: Code2,
}

export function TeaserCards() {
  const openSkillModal = usePortfolioStore((s) => s.openSkillModal)
  const { progress } = useGameProgress()

  return (
    <section id="skills" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[#aaff00] text-xs font-mono tracking-[0.3em] uppercase mb-2">Skill Arsenal</p>
        <h2
          className="text-4xl md:text-5xl font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          The Codex Entries
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SKILL_CARDS.map((skill, i) => {
          const Icon = ICONS[skill.id] ?? Code2
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{
                y: -8,
                rotateX: 4,
                rotateY: 4,
                boxShadow: `0 20px 60px ${skill.color}44`,
                borderColor: `${skill.color}88`,
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${skill.color}33`,
                backdropFilter: 'blur(20px)',
                transformStyle: 'preserve-3d',
              }}
              className="rounded-2xl p-6 cursor-pointer"
              onClick={() => {
                openSkillModal(skill)
                progress(8)
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${skill.color}22`, boxShadow: `0 0 20px ${skill.color}33` }}
              >
                <Icon size={20} style={{ color: skill.color }} />
              </div>
              <h3
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {skill.label}
              </h3>
              <p className="text-xs text-[#666] uppercase tracking-wider font-mono mb-3">{skill.description}</p>
              <p className="text-[#aaa] text-sm leading-relaxed line-clamp-2">{skill.lore}</p>
              <div
                className="mt-4 text-xs font-mono tracking-widest uppercase"
                style={{ color: skill.color }}
              >
                → Read Codex Entry
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
