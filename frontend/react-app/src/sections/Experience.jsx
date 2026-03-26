import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { EASE_APPLE } from "../lib/motionVariants.js";
import { useAppStore } from "../store/index.js";

const TYPE_COLOR = {
  "Full-time":          "#6366f1",
  "Freelance":          "#a78bfa",
  "External Consultant":"#06b6d4",
  "Internship":         "#10b981",
};

export default function ExperienceSection({ experience }) {
  const { ref } = useSectionObserver(4);
  const [active, setActive] = useState(0);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);
  const current = experience[active];
  const accentColor = TYPE_COLOR[current.type] ?? "#6366f1";

  return (
    <section
      id="experience"
      ref={ref}
      className="relative py-36 md:py-52 px-6 md:px-16 lg:px-28 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 110% 80% at 50% 50%, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.97) 100%)" }}
    >
      {/* Giant background chapter number */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{
          fontSize: "clamp(12rem, 28vw, 22rem)",
          fontWeight: 900,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(99,102,241,0.06)",
          letterSpacing: "-0.07em",
        }}
      >
        04
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Chapter label */}
        <Reveal>
          <div className="flex items-center gap-4 mb-20">
            <span className="h-px w-12 bg-indigo-500/40" />
            <p className="text-[0.55rem] tracking-[0.45em] uppercase text-indigo-400/60">
              Chapter 04 / Mission Log
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2
            className="font-extralight leading-[1.05] tracking-[-0.04em] text-white mb-16"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
          >
            The{" "}
            <em
              className="not-italic font-black"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              journey.
            </em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16">
          {/* ── Left: timeline navigation ── */}
          <div className="flex flex-col relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-6 bottom-6 w-px bg-white/[0.06] hidden sm:block" />

            {experience.map((exp, i) => (
              <Reveal key={exp.id} delay={0.05 * i}>
                <button
                  className="relative flex items-start gap-4 py-4 pl-2 text-left w-full group cursor-none"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setCursorVariant("hover")}
                  onMouseLeave={() => setCursorVariant("default")}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className="relative z-10 w-6 h-6 flex-shrink-0 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-300"
                    animate={{
                      borderColor: i === active ? `${TYPE_COLOR[exp.type] ?? "#6366f1"}80` : "rgba(255,255,255,0.08)",
                      background:  i === active ? `${TYPE_COLOR[exp.type] ?? "#6366f1"}18` : "transparent",
                    }}
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      animate={{ background: i === active ? (TYPE_COLOR[exp.type] ?? "#6366f1") : "rgba(255,255,255,0.2)" }}
                    />
                  </motion.div>

                  <div className="flex flex-col">
                    <p className="text-[0.52rem] tracking-[0.22em] uppercase text-white/22 mb-0.5">
                      {exp.period}
                    </p>
                    <p
                      className="text-[0.85rem] font-light transition-colors duration-200"
                      style={{ color: i === active ? "#ffffff" : "rgba(255,255,255,0.38)" }}
                    >
                      {exp.role}
                    </p>
                    <p className="text-[0.65rem] text-white/25 mt-0.5">{exp.company}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          {/* ── Right: detail panel ── */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="p-8 rounded-3xl border bg-white/[0.015] overflow-hidden relative"
                style={{ borderColor: `${accentColor}25` }}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: EASE_APPLE }}
              >
                {/* Top accent glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` }}
                />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                  <div>
                    <motion.span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.52rem] tracking-widest uppercase rounded-full border mb-3"
                      style={{ borderColor: `${accentColor}40`, color: `${accentColor}` }}
                      layoutId="type-badge"
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: accentColor }} />
                      {current.type}
                    </motion.span>
                    <h3
                      className="font-extralight text-white leading-tight"
                      style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
                    >
                      {current.role}
                    </h3>
                    <p className="text-[0.78rem] text-white/38 mt-1.5">
                      {current.company} · {current.location}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 text-[0.55rem] tracking-widest uppercase text-white/30 border border-white/[0.08] rounded-full flex-shrink-0 h-fit">
                    {current.period}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[0.86rem] font-light leading-[1.9] text-white/40 mb-8 border-b border-white/[0.06] pb-8">
                  {current.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-col gap-3 mb-8">
                  {current.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.07 * i, duration: 0.4 }}
                    >
                      <span className="flex-shrink-0 mt-1" style={{ color: accentColor, opacity: 0.7 }}>◎</span>
                      <p className="text-[0.8rem] font-light text-white/48 leading-relaxed">{h}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Stack chips */}
                <div className="flex flex-wrap gap-2">
                  {current.stack.map((tech) => (
                    <motion.span
                      key={tech}
                      className="px-2.5 py-1 text-[0.58rem] tracking-[0.08em] text-white/30 border border-white/[0.07] rounded-full bg-white/[0.02] hover:border-indigo-500/30 hover:text-indigo-300/60 transition-all duration-200 cursor-none"
                      whileHover={{ scale: 1.05, y: -1 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
