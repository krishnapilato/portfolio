import { motion } from "framer-motion";
import { lazy, Suspense, useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

const SkillsScene = lazy(() => import("../scenes/SkillsScene.jsx"));

const CAT_META = {
  backend:  { label: "Backend",  color: "#6366f1", icon: "⬡" },
  frontend: { label: "Frontend", color: "#a78bfa", icon: "◈" },
  data:     { label: "Data",     color: "#06b6d4", icon: "◉" },
  cloud:    { label: "Cloud",    color: "#10b981", icon: "◎" },
};

function SkillBar({ skill, index }) {
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);
  const color = CAT_META[skill.category]?.color ?? "#6366f1";

  return (
    <motion.div
      className="flex items-center gap-4 group cursor-none"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      whileHover={{ x: 5 }}
      onMouseEnter={() => setCursorVariant("hover")}
      onMouseLeave={() => setCursorVariant("default")}
    >
      {/* Skill name */}
      <span className="text-[0.7rem] font-light text-white/45 w-28 flex-shrink-0 group-hover:text-white/80 transition-colors duration-200">
        {skill.name}
      </span>

      {/* Bar track */}
      <div className="flex-1 h-px bg-white/[0.07] relative overflow-hidden rounded-full">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: "0%" }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.04 }}
        />
      </div>

      {/* Percentage */}
      <span className="text-[0.56rem] font-mono text-white/22 w-8 text-right">{skill.level}%</span>
    </motion.div>
  );
}

export default function SkillsSection({ skills, isMobile }) {
  const { ref } = useSectionObserver(3);
  const activeNode = useAppStore((s) => s.activeSkillNode);
  const [activeCategory, setActiveCategory] = useState("backend");

  const groups = Object.entries(skills).map(([key, items]) => ({
    key,
    ...CAT_META[key],
    items,
  }));

  const skillGroups = groups.map((g) => ({ key: g.key, label: g.label, items: g.items }));
  const activeGroup = groups.find((g) => g.key === activeCategory);

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-36 md:py-52 px-6 md:px-16 lg:px-28 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 110% 80% at 50% 50%, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.98) 100%)",
        borderTop:    "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Giant background chapter number */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{
          fontSize: "clamp(12rem, 28vw, 22rem)",
          fontWeight: 900,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(99,102,241,0.06)",
          letterSpacing: "-0.07em",
        }}
      >
        03
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Chapter label */}
        <Reveal>
          <div className="flex items-center gap-4 mb-20">
            <span className="h-px w-12 bg-indigo-500/40" />
            <p className="text-[0.55rem] tracking-[0.45em] uppercase text-indigo-400/60">
              Chapter 03 / Flight Instruments
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
          {/* ── Left: 3D orbital canvas ── */}
          <Reveal delay={0.05}>
            <div
              className="w-full rounded-3xl border border-white/[0.06] overflow-hidden relative"
              style={{
                height: isMobile ? "300px" : "460px",
                background: "radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, rgba(0,0,0,0.5) 70%)",
              }}
            >
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center text-white/20 text-[0.58rem] tracking-widest uppercase">
                  Loading orbital…
                </div>
              }>
                <SkillsScene skills={skillGroups} isMobile={isMobile} />
              </Suspense>
            </div>

            {/* Active node display */}
            <motion.p
              className="text-[0.52rem] tracking-[0.28em] uppercase text-center mt-3"
              animate={{ color: activeNode ? "#a78bfa" : "rgba(255,255,255,0.15)" }}
            >
              {activeNode ? `▸ ${activeNode}` : "Hover nodes · drag to orbit"}
            </motion.p>
          </Reveal>

          {/* ── Right: category tabs + bars ── */}
          <div>
            <Reveal delay={0.1}>
              <h2
                className="font-extralight leading-[1.05] tracking-[-0.04em] text-white mb-3"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)" }}
              >
                Tools for the{" "}
                <em
                  className="not-italic font-black"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  job.
                </em>
              </h2>
              <p className="text-[0.78rem] font-light text-white/30 mb-10">
                Battle-tested across 4+ years of production engineering — not just tutorials.
              </p>
            </Reveal>

            {/* Category selector */}
            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-2 mb-10">
                {groups.map((g) => (
                  <motion.button
                    key={g.key}
                    className="px-3 py-1.5 text-[0.58rem] tracking-widest uppercase rounded-full border transition-all duration-200 cursor-none flex items-center gap-1.5"
                    style={{
                      borderColor: activeCategory === g.key ? `${g.color}60` : "rgba(255,255,255,0.08)",
                      color:       activeCategory === g.key ? g.color       : "rgba(255,255,255,0.28)",
                      background:  activeCategory === g.key ? `${g.color}12` : "transparent",
                    }}
                    onClick={() => setActiveCategory(g.key)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span style={{ opacity: 0.7 }}>{g.icon}</span>
                    {g.label}
                  </motion.button>
                ))}
              </div>
            </Reveal>

            {/* Skill bars */}
            <div className="flex flex-col gap-5">
              {activeGroup?.items.map((skill, i) => (
                <SkillBar key={skill.id} skill={skill} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
