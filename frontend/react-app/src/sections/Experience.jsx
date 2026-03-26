import { motion } from "framer-motion";
import { useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

export default function ExperienceSection({ experience }) {
  const { ref } = useSectionObserver(4);
  const [active, setActive] = useState(0);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  const current = experience[active];

  return (
    <section
      id="experience"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-16 lg:px-28"
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-[0.58rem] tracking-[0.38em] uppercase text-indigo-400/60 mb-16">
            04 / Experience Timeline
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Left: timeline nav */}
          <div className="flex flex-col gap-1">
            {experience.map((exp, i) => (
              <Reveal key={exp.id} delay={0.06 * i}>
                <button
                  className="group text-left px-4 py-4 rounded-xl border transition-all duration-300 cursor-none w-full"
                  style={{
                    borderColor: i === active ? "rgba(99,102,241,0.4)" : "transparent",
                    background: i === active ? "rgba(99,102,241,0.06)" : "transparent",
                  }}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setCursorVariant("hover")}
                  onMouseLeave={() => setCursorVariant("default")}
                >
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/25 mb-1">
                    {exp.period}
                  </p>
                  <p
                    className="text-sm font-light transition-colors duration-200"
                    style={{ color: i === active ? "#ffffff" : "rgba(255,255,255,0.42)" }}
                  >
                    {exp.role}
                  </p>
                  <p className="text-[0.68rem] text-white/28 mt-0.5">{exp.company}</p>
                </button>
              </Reveal>
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-2">
            <Reveal delay={0.1}>
              <motion.div
                key={current.id}
                className="p-8 rounded-3xl border border-white/[0.07] bg-white/[0.015]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[0.58rem] tracking-[0.28em] uppercase text-indigo-400/70 mb-2">
                      {current.type}
                    </p>
                    <h3
                      className="font-light text-white leading-tight"
                      style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)" }}
                    >
                      {current.role}
                    </h3>
                    <p className="text-[0.8rem] text-white/40 mt-1">
                      {current.company} · {current.location}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-[0.58rem] tracking-widest uppercase text-white/35 border border-white/[0.1] rounded-full flex-shrink-0 h-fit">
                    {current.period}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[0.88rem] font-light leading-[1.85] text-white/45 mb-8">
                  {current.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-col gap-3 mb-8">
                  {current.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.4 }}
                    >
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">◎</span>
                      <p className="text-[0.8rem] font-light text-white/50 leading-relaxed">{h}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Stack */}
                <div className="flex flex-wrap gap-2">
                  {current.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-[0.6rem] tracking-[0.08em] text-white/35 border border-white/[0.08] rounded-full bg-white/[0.02]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
