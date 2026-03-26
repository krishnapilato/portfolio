import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import { EASE_APPLE } from "../lib/motionVariants.js";
import { useAppStore } from "../store/index.js";

const HeroScene = lazy(() => import("../scenes/HeroScene.jsx"));

export default function HeroSection({ personal, isMobile }) {
  const { ref } = useSectionObserver(1);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* 3D glass gyroscope canvas */}
      <Suspense fallback={null}>
        <HeroScene isMobile={isMobile} />
      </Suspense>

      {/* Radial vignette — deepens edges to contrast against tunnel */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(5,5,5,0.55) 70%, rgba(5,5,5,0.9) 100%)",
        }}
      />

      {/* ── Chapter marker (top-left) ── */}
      <motion.div
        className="absolute top-8 left-8 z-[3] pointer-events-none"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: EASE_APPLE, delay: 1.6 }}
      >
        <p className="text-[0.52rem] tracking-[0.45em] uppercase text-white/25">
          Chapter 01
        </p>
        <p className="text-[0.48rem] tracking-[0.3em] uppercase text-indigo-400/50 mt-0.5">
          Identity
        </p>
      </motion.div>

      {/* ── Core overlay text ── */}
      <div className="relative z-[2] text-center pointer-events-none mix-blend-screen px-6 flex flex-col items-center">
        {/* Role label */}
        <motion.p
          className="text-[0.6rem] tracking-[0.5em] uppercase text-white/35 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_APPLE, delay: 0.4 }}
        >
          {personal.role}
        </motion.p>

        {/* Giant name — two lines, contrasting weights */}
        <motion.h1
          className="font-light leading-[0.88] tracking-[-0.05em] select-none"
          style={{ fontSize: "clamp(4rem, 14vw, 10.5rem)" }}
          initial={{ opacity: 0, filter: "blur(32px)", y: 40 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.8, ease: EASE_APPLE }}
        >
          {personal.nameShort.split(" ").map((word, i) => (
            <span
              key={word}
              className="block"
              style={{
                fontWeight:    i === 0 ? 200 : 800,
                letterSpacing: i === 0 ? "-0.05em" : "-0.06em",
                // The second word gets a gradient shimmer
                background:    i === 1
                  ? "linear-gradient(90deg, #fff 0%, #a78bfa 50%, #fff 100%)"
                  : undefined,
                backgroundClip:  i === 1 ? "text" : undefined,
                WebkitBackgroundClip: i === 1 ? "text" : undefined,
                WebkitTextFillColor: i === 1 ? "transparent" : undefined,
              }}
            >
              {word.toUpperCase()}
            </span>
          ))}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-[0.62rem] tracking-[0.35em] uppercase text-white/20 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE_APPLE, delay: 1 }}
        >
          {personal.tagline}
        </motion.p>

        {/* Location pill */}
        <motion.div
          className="mt-8 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE_APPLE, delay: 1.3 }}
        >
          <span className="h-px w-8 bg-white/15" />
          <span className="text-[0.52rem] tracking-[0.4em] uppercase text-white/25">
            {personal.location}
          </span>
          <span className="h-px w-8 bg-white/15" />
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1.2 }}
      >
        <span className="text-[0.48rem] tracking-[0.42em] uppercase text-white/20">
          Begin journey
        </span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-indigo-400/40 to-transparent"
          animate={{ y: [0, 10, 0], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Available badge (bottom-right) ── */}
      {personal.available && (
        <motion.div
          className="absolute bottom-10 right-8 z-[3] flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/30 backdrop-blur-sm cursor-none"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.9, ease: EASE_APPLE }}
          onMouseEnter={() => setCursorVariant("hover")}
          onMouseLeave={() => setCursorVariant("default")}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.5rem] tracking-widest uppercase text-emerald-400/70">
            {personal.availableText}
          </span>
        </motion.div>
      )}
    </section>
  );
}
