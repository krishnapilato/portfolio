/**
 * FallbackPortfolio — lightweight 2D/DOM-only portfolio for low-end devices.
 *
 * When the PerformanceManager detects "potato" tier (or WebGL is unavailable),
 * this component replaces the full 3D experience with a clean, fast,
 * accessible DOM-based layout that still communicates the aviation theme.
 */

import { motion } from "framer-motion";
import { memo } from "react";
import content from "../../data/content.json";
import { EASE_APPLE } from "../../lib/motionVariants.js";

function FallbackPortfolio() {
  const { personal, about, stats, skills, experience, projects, contacts } = content;

  return (
    <div className="min-h-screen bg-void text-text-primary">
      {/* Header */}
      <header className="px-6 py-16 max-w-3xl mx-auto text-center">
        <motion.p
          className="text-[0.56rem] tracking-[0.5em] uppercase text-indigo-400/60 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE_APPLE }}
        >
          ✈ Aviation Portfolio — Lite Mode
        </motion.p>
        <motion.h1
          className="text-5xl sm:text-6xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_APPLE, delay: 0.2 }}
        >
          {personal.nameShort}
        </motion.h1>
        <motion.p
          className="text-text-secondary mt-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {personal.role} · {personal.location}
        </motion.p>
        {personal.available && (
          <motion.div
            className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/30 text-[0.52rem] tracking-widest uppercase text-emerald-400/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {personal.availableText}
          </motion.div>
        )}
      </header>

      {/* About */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.4em] uppercase text-indigo-400/50 mb-6">About</h2>
        {about.map((p, i) => (
          <p key={i} className="text-text-secondary text-sm leading-relaxed mb-4">{p}</p>
        ))}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-accent">{s.value}</div>
              <div className="text-[0.52rem] tracking-wider uppercase text-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.4em] uppercase text-indigo-400/50 mb-6">Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-[0.56rem] tracking-[0.3em] uppercase text-white/35 mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <span key={s.name} className="px-2.5 py-1 rounded-md bg-surface-2 text-[0.54rem] text-text-secondary border border-border">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.4em] uppercase text-indigo-400/50 mb-6">Flight Log</h2>
        <div className="space-y-6">
          {experience.map((exp) => (
            <div key={exp.id} className="p-4 rounded-lg border border-border bg-surface/50">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="font-medium text-sm">{exp.role}</h3>
                  <p className="text-text-secondary text-xs mt-0.5">{exp.company}</p>
                </div>
                <span className="text-[0.48rem] tracking-wider uppercase text-text-muted">{exp.period}</span>
              </div>
              <p className="text-text-secondary text-xs mt-2 leading-relaxed">{exp.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-xs tracking-[0.4em] uppercase text-indigo-400/50 mb-6">Missions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border border-border bg-surface/50">
              <h3 className="font-medium text-sm">{p.title}</h3>
              <p className="text-text-secondary text-xs mt-1 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.tech.map((t) => (
                  <span key={t} className="text-[0.46rem] tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400/60">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <footer className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-xs tracking-[0.4em] uppercase text-indigo-400/50 mb-6">Contact Tower</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-border bg-surface/50 text-text-secondary text-xs hover:border-indigo-500/30 hover:text-indigo-400 transition-colors"
            >
              {c.label}
            </a>
          ))}
        </div>
        <p className="text-text-muted text-[0.46rem] tracking-wider uppercase mt-8">
          © {new Date().getFullYear()} {personal.nameShort} — Aviation Portfolio
        </p>
      </footer>
    </div>
  );
}

export default memo(FallbackPortfolio);
