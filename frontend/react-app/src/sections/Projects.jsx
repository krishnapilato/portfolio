import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

// ─── 3D tilt card (desktop only) ─────────────────────────────────────────────

function TiltCard({ project, children, onClick }) {
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]),  { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]),  { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width  - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      className="cursor-none"
      style={{ perspective: 900, rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={() => { onLeave(); setCursorVariant("default"); }}
      onMouseEnter={() => setCursorVariant("hover")}
    >
      {children}
    </motion.div>
  );
}

// ─── Featured project card ────────────────────────────────────────────────────

function FeaturedCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  return (
    <Reveal delay={0.07 * index} className="h-full">
      <TiltCard project={project}>
        <motion.div
          className="relative flex flex-col p-8 rounded-3xl border overflow-hidden h-full"
          style={{
            borderColor: hovered ? `${project.color}45` : "rgba(255,255,255,0.06)",
            background:  hovered ? `${project.color}08`  : "rgba(5,5,5,0.6)",
            backdropFilter: "blur(12px)",
          }}
          animate={{ y: hovered ? -6 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onHoverStart={() => {
            setHovered(true);
            if (index === 0) unlockAchievement("first_project", "Explored the lab!");
          }}
          onHoverEnd={() => setHovered(false)}
        >
          {/* Corner glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `radial-gradient(circle at 50% -20%, ${project.color}20 0%, transparent 55%)`,
            }}
          />

          {/* Top line accent */}
          <motion.div
            className="absolute top-0 left-8 right-8 h-px"
            animate={{ opacity: hovered ? 1 : 0 }}
            style={{ background: `linear-gradient(90deg, transparent, ${project.color}60, transparent)` }}
          />

          {/* Num */}
          <p
            className="text-[0.55rem] tracking-[0.35em] uppercase mb-5 font-mono"
            style={{ color: `${project.color}70` }}
          >
            {project.num}
          </p>

          {/* Category */}
          <p className="text-[0.56rem] tracking-[0.22em] uppercase text-white/22 mb-2">{project.category}</p>

          {/* Title */}
          <h3
            className="font-extralight text-white leading-tight mb-4 tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)" }}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[0.8rem] font-light leading-[1.85] text-white/35 mb-6 flex-1">
            {project.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
            <div className="flex flex-wrap gap-1.5">
              {project.tech.slice(0, 3).map((t) => (
                <span key={t} className="px-2 py-0.5 text-[0.52rem] tracking-[0.06em] text-white/25 border border-white/[0.06] rounded-full">
                  {t}
                </span>
              ))}
              {project.tech.length > 3 && (
                <span className="px-2 py-0.5 text-[0.52rem] text-white/18 border border-white/[0.04] rounded-full">
                  +{project.tech.length - 3}
                </span>
              )}
            </div>
            <span
              className="text-[0.55rem] tracking-widest uppercase px-2.5 py-1 rounded-full border"
              style={{ borderColor: `${project.color}35`, color: `${project.color}85` }}
            >
              {project.status}
            </span>
          </div>
        </motion.div>
      </TiltCard>
    </Reveal>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function ProjectsSection({ projects }) {
  const { ref } = useSectionObserver(5);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  const featured = projects.filter((p) => p.featured);
  const rest     = projects.filter((p) => !p.featured);

  return (
    <section
      id="projects"
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
        05
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Chapter label */}
        <Reveal>
          <div className="flex items-center gap-4 mb-20">
            <span className="h-px w-12 bg-indigo-500/40" />
            <p className="text-[0.55rem] tracking-[0.45em] uppercase text-indigo-400/60">
              Chapter 05 / Completed Missions
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2
            className="font-extralight leading-[1.02] tracking-[-0.04em] text-white mb-4"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
          >
            Things I&apos;ve actually{" "}
            <em
              className="not-italic font-black"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              shipped.
            </em>
          </h2>
          <p className="text-[0.78rem] font-light text-white/28 mb-16">
            Evidence over claims — code that runs in production.
          </p>
        </Reveal>

        {/* Featured grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {featured.map((project, i) => (
            <FeaturedCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Non-featured list */}
        <div className="border-t border-white/[0.05] mt-8">
          {rest.map((project, i) => (
            <Reveal key={project.id} delay={0.04 * i}>
              <motion.div
                className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-b border-white/[0.05] cursor-none group"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                onMouseEnter={() => setCursorVariant("hover")}
                onMouseLeave={() => setCursorVariant("default")}
              >
                <span
                  className="text-[0.55rem] font-mono tracking-[0.2em] text-white/18 w-7 flex-shrink-0"
                  style={{ color: `${project.color}60` }}
                >
                  {project.num}
                </span>
                <div className="flex-1">
                  <p className="text-[0.56rem] tracking-[0.18em] uppercase text-white/22 mb-0.5">{project.category}</p>
                  <h4 className="text-[0.95rem] font-light text-white/75 group-hover:text-white transition-colors duration-200">
                    {project.title}
                  </h4>
                </div>
                <p className="text-[0.76rem] font-light text-white/28 max-w-xs hidden lg:block leading-relaxed">
                  {project.description.substring(0, 85)}…
                </p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[0.55rem] font-mono text-white/18">{project.year}</span>
                  <span
                    className="text-[0.55rem] tracking-widest uppercase px-2.5 py-1 border rounded-full"
                    style={{ borderColor: `${project.color}30`, color: `${project.color}65` }}
                  >
                    {project.status}
                  </span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
