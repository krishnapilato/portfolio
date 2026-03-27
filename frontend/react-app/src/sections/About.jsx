import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedStat({ value, label, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    // Parse the numeric part (e.g. "4+" → 4, "100%" → 100)
    const raw   = parseInt(value, 10) || 0;
    const suffix = value.replace(/[0-9]/g, "");
    let start = null;
    const duration = 1400;

    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(ease * raw) + suffix);
      if (pct < 1) requestAnimationFrame(step);
    };

    const timer = setTimeout(() => requestAnimationFrame(step), delay * 1000);
    return () => clearTimeout(timer);
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-1 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-500 cursor-none"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <p
        className="font-extralight tracking-[-0.05em] text-white"
        style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
      >
        {display}
      </p>
      <p className="text-[0.6rem] tracking-[0.15em] uppercase text-white/30 mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function AboutSection({ about, stats }) {
  const { ref } = useSectionObserver(2);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-36 md:py-52 px-6 md:px-16 lg:px-28 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 110% 80% at 50% 50%, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.97) 100%)" }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.016]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

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
        02
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Chapter label */}
        <Reveal>
          <div className="flex items-center gap-4 mb-20">
            <span className="h-px w-12 bg-indigo-500/40" />
            <p className="text-[0.55rem] tracking-[0.45em] uppercase text-indigo-400/60">
              Chapter 02 / Pilot Profile
            </p>
          </div>
        </Reveal>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          {/* ── Left: headline + stats ── */}
          <div>
            <Reveal delay={0.08}>
              <h2
                className="font-extralight leading-[1.05] tracking-[-0.04em] text-white mb-6"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
              >
                I ship things that{" "}
                <em
                  className="not-italic font-black"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  work.
                </em>
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="text-[0.82rem] font-light leading-[1.95] text-white/38 max-w-sm mb-14">
                Production systems for major institutions, not just side projects.
                Full-stack, cross-functional, and focused on outcomes that matter.
              </p>
            </Reveal>

            {/* Stats — animated number counters */}
            <div
              className="grid grid-cols-2 gap-4"
              onMouseEnter={() => setCursorVariant("hover")}
              onMouseLeave={() => setCursorVariant("default")}
            >
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={0.1 * (i + 1)}>
                  <AnimatedStat value={stat.value} label={stat.label} delay={0.15 * i} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── Right: bio paragraphs as "system logs" ── */}
          <div className="flex flex-col gap-8 lg:pt-2">
            {about.map((paragraph, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <div className="flex gap-5 group">
                  {/* Line number glyph */}
                  <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                    <span
                      className="text-[0.45rem] font-mono tracking-widest text-indigo-500/40 group-hover:text-indigo-400/60 transition-colors"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < about.length - 1 && (
                      <span className="w-px flex-1 bg-white/[0.05]" style={{ minHeight: "32px" }} />
                    )}
                  </div>
                  <p className="text-[0.9rem] font-light leading-[1.95] text-white/42 group-hover:text-white/62 transition-colors duration-500">
                    {paragraph}
                  </p>
                </div>
              </Reveal>
            ))}

            {/* Mindset tags */}
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Precision", "Performance", "Altitude", "Craft", "Systems", "Scale"].map((tag) => (
                  <motion.span
                    key={tag}
                    className="px-3 py-1 text-[0.58rem] tracking-widest uppercase text-white/30 border border-white/[0.07] rounded-full bg-white/[0.02] hover:border-indigo-500/40 hover:text-indigo-300/60 transition-all duration-300 cursor-none"
                    whileHover={{ scale: 1.05, y: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    onMouseEnter={() => setCursorVariant("hover")}
                    onMouseLeave={() => setCursorVariant("default")}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
