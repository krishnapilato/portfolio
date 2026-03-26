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
      {/* 3D canvas */}
      <Suspense fallback={null}>
        <HeroScene isMobile={isMobile} />
      </Suspense>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(5,5,5,0.6) 100%)",
        }}
      />

      {/* Overlay text */}
      <div className="relative z-[2] text-center pointer-events-none mix-blend-screen px-6">
        <motion.p
          className="text-[0.65rem] tracking-[0.45em] uppercase text-white/40 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_APPLE, delay: 0.3 }}
        >
          {personal.role}
        </motion.p>

        <motion.h1
          className="font-light leading-[0.9] tracking-[-0.04em]"
          style={{ fontSize: "clamp(3.8rem, 13vw, 9.5rem)" }}
          initial={{ opacity: 0, filter: "blur(24px)", y: 36 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.6, ease: EASE_APPLE }}
        >
          {personal.nameShort.split(" ").map((word, i) => (
            <span
              key={word}
              className="block"
              style={{ fontWeight: i === 0 ? 200 : 700, letterSpacing: i === 0 ? "-0.04em" : "-0.06em" }}
            >
              {word.toUpperCase()}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="text-[0.6rem] tracking-[0.5em] uppercase text-white/25 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE_APPLE, delay: 0.8 }}
        >
          {personal.location} · {personal.availableText}
        </motion.p>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-3 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span className="text-[0.52rem] tracking-[0.35em] uppercase text-white/25">Explore</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Available badge */}
      {personal.available && (
        <motion.div
          className="absolute bottom-10 right-8 z-[2] flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 cursor-none"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.8, ease: EASE_APPLE }}
          onMouseEnter={() => setCursorVariant("hover")}
          onMouseLeave={() => setCursorVariant("default")}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.55rem] tracking-widest uppercase text-emerald-400/80">
            Available
          </span>
        </motion.div>
      )}
    </section>
  );
}
