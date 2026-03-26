import { motion } from "framer-motion";
import { useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

export default function ProjectsSection({ projects }) {
  const { ref } = useSectionObserver(5);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);
  const [hovered, setHovered] = useState(null);

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-16 lg:px-28"
      style={{ background: "rgba(255,255,255,0.014)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-[0.58rem] tracking-[0.38em] uppercase text-indigo-400/60 mb-16">
            05 / Projects Lab
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            className="font-light leading-[1.05] tracking-[-0.03em] text-white mb-16"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4rem)" }}
          >
            Selected <em className="not-italic font-bold">work.</em>
          </h2>
        </Reveal>

        {/* Featured cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={0.08 * i} className="h-full">
              <motion.div
                className="relative group flex flex-col p-8 rounded-3xl border overflow-hidden cursor-none h-full"
                style={{
                  borderColor: hovered === project.id ? `${project.color}40` : "rgba(255,255,255,0.07)",
                  background: hovered === project.id ? `${project.color}08` : "rgba(255,255,255,0.015)",
                }}
                onHoverStart={() => {
                  setHovered(project.id);
                  setCursorVariant("hover", "View");
                  if (i === 0) unlockAchievement("first_project", "Explored the lab");
                }}
                onHoverEnd={() => { setHovered(null); setCursorVariant("default"); }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                {/* Glow */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${project.color}18 0%, transparent 60%)`,
                  }}
                />

                {/* Number */}
                <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-6" style={{ color: `${project.color}80` }}>
                  {project.num}
                </p>

                {/* Category */}
                <p className="text-[0.6rem] tracking-[0.22em] uppercase text-white/25 mb-2">
                  {project.category}
                </p>

                {/* Title */}
                <h3
                  className="font-light text-white leading-tight mb-4"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
                >
                  {project.title}
                </h3>

                {/* Desc */}
                <p className="text-[0.82rem] font-light leading-[1.8] text-white/38 mb-6">
                  {project.description}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 text-[0.55rem] tracking-[0.06em] text-white/28 border border-white/[0.07] rounded-full">
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="px-2 py-0.5 text-[0.55rem] text-white/20 border border-white/[0.05] rounded-full">
                        +{project.tech.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-[0.6rem] tracking-widest uppercase px-2 py-1 rounded-full border"
                    style={{ borderColor: `${project.color}35`, color: `${project.color}90` }}>
                    {project.status}
                  </span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Non-featured list */}
        {rest.map((project, i) => (
          <Reveal key={project.id} delay={0.05 * i}>
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-t cursor-none"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.02)", x: 8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setCursorVariant("hover")}
              onMouseLeave={() => setCursorVariant("default")}
            >
              <span className="text-[0.6rem] tracking-[0.2em] text-white/20 w-8">{project.num}</span>
              <div className="flex-1">
                <p className="text-[0.6rem] tracking-[0.18em] uppercase text-white/25 mb-1">{project.category}</p>
                <h4 className="text-base font-light text-white/80">{project.title}</h4>
              </div>
              <p className="text-[0.78rem] font-light text-white/35 max-w-sm hidden lg:block">{project.description.substring(0, 80)}…</p>
              <div className="flex items-center gap-3">
                <span className="text-[0.58rem] text-white/20">{project.year}</span>
                <span className="text-[0.58rem] tracking-widest uppercase px-2 py-0.5 border rounded-full"
                  style={{ borderColor: `${project.color}30`, color: `${project.color}70` }}>
                  {project.status}
                </span>
              </div>
            </motion.div>
          </Reveal>
        ))}

        <div className="border-t border-white/[0.07] mt-2" />
      </div>
    </section>
  );
}
