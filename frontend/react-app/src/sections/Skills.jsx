import { motion } from "framer-motion";
import { lazy, Suspense, useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

const SkillsScene = lazy(() => import("../scenes/SkillsScene.jsx"));

const CAT_LABELS = {
  backend:  { label: "Backend", color: "#6366f1" },
  frontend: { label: "Frontend", color: "#8b5cf6" },
  data:     { label: "Data",     color: "#06b6d4" },
  cloud:    { label: "Cloud",    color: "#10b981" },
};

function SkillBar({ skill }) {
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);
  return (
    <motion.div
      className="flex items-center gap-3 group cursor-none"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseEnter={() => setCursorVariant("hover")}
      onMouseLeave={() => setCursorVariant("default")}
    >
      <span className="text-[0.72rem] font-light text-white/55 w-28 flex-shrink-0 group-hover:text-white/80 transition-colors">
        {skill.name}
      </span>
      <div className="flex-1 h-px bg-white/[0.07] relative overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ background: CAT_LABELS[skill.category]?.color ?? "#6366f1" }}
          initial={{ width: "0%" }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
      <span className="text-[0.58rem] text-white/25 w-8 text-right">{skill.level}%</span>
    </motion.div>
  );
}

export default function SkillsSection({ skills, isMobile }) {
  const { ref } = useSectionObserver(3);
  const activeNode = useAppStore((s) => s.activeSkillNode);
  const [activeCategory, setActiveCategory] = useState("backend");

  // Build groups for the list view
  const groups = Object.entries(skills).map(([key, items]) => ({
    key,
    ...CAT_LABELS[key],
    items,
  }));

  const skillGroups = groups.map((g) => ({
    key: g.key,
    label: g.label,
    items: g.items,
  }));

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-16 lg:px-28"
      style={{ background: "rgba(255,255,255,0.014)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-[0.58rem] tracking-[0.38em] uppercase text-indigo-400/60 mb-16">
            03 / Skills Matrix
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: 3D canvas */}
          <Reveal delay={0.05}>
            <div
              className="w-full rounded-3xl border border-white/[0.07] overflow-hidden"
              style={{ height: isMobile ? "320px" : "480px", background: "rgba(0,0,0,0.4)" }}
            >
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs tracking-widest uppercase">
                  Loading 3D...
                </div>
              }>
                <SkillsScene skills={skillGroups} isMobile={isMobile} />
              </Suspense>
            </div>
            <p className="text-[0.55rem] tracking-[0.25em] uppercase text-white/18 mt-3 text-center">
              {activeNode ? `Active: ${activeNode}` : "Hover nodes to explore"}
            </p>
          </Reveal>

          {/* Right: category tabs + bars */}
          <div>
            <Reveal delay={0.1}>
              <h2
                className="font-light leading-[1.08] tracking-[-0.03em] text-white mb-10"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                Technology <em className="not-italic font-bold">stack.</em>
              </h2>
            </Reveal>

            {/* Category tabs */}
            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-2 mb-8">
                {groups.map((g) => (
                  <button
                    key={g.key}
                    className="px-3 py-1.5 text-[0.6rem] tracking-widest uppercase rounded-full border transition-all duration-200 cursor-none"
                    style={{
                      borderColor: activeCategory === g.key ? g.color : "rgba(255,255,255,0.1)",
                      color: activeCategory === g.key ? g.color : "rgba(255,255,255,0.3)",
                      background: activeCategory === g.key ? `${g.color}15` : "transparent",
                    }}
                    onClick={() => setActiveCategory(g.key)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Skill bars */}
            <div className="flex flex-col gap-4">
              {groups
                .find((g) => g.key === activeCategory)
                ?.items.map((skill, i) => (
                  <Reveal key={skill.id} delay={0.06 * i}>
                    <SkillBar skill={skill} />
                  </Reveal>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
