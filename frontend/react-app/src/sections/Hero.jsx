import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import { EASE_APPLE } from "../lib/motionVariants.js";
import { useAppStore } from "../store/index.js";

// ─── Capabilities that cycle to answer "what problems can you solve?" ──────────

const CAPABILITIES = [
  "distributed systems",
  "real-time data pipelines",
  "enterprise Java backends",
  "cloud-native microservices",
  "immersive 3D frontends",
  "APIs that scale",
];

// ─── Animated cycling capability statement ───────────────────────────────────

function CapabilityTypewriter() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // hold → fade out → advance → fade in
    const hold = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(hold);
  }, [index]);

  useEffect(() => {
    if (!visible) {
      const advance = setTimeout(() => {
        setIndex((i) => (i + 1) % CAPABILITIES.length);
        setVisible(true);
      }, 380);
      return () => clearTimeout(advance);
    }
  }, [visible]);

  return (
    <span
      className="inline-flex items-baseline overflow-hidden"
      style={{ minWidth: "22ch" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          className="inline-block font-medium"
          style={{
            background: "linear-gradient(90deg, #6366f1, #a78bfa 60%, #e879f9)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ y: 18, opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0,  opacity: 1, filter: "blur(0px)" }}
          exit={{   y: -14, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.38, ease: EASE_APPLE }}
        >
          {CAPABILITIES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

export default function HeroSection({ personal }) {
  const { ref } = useSectionObserver(1);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* ── Perspective grid — recedes into the tunnel ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ perspective: "700px" }}
      >
        <div
          className="absolute left-[-60%] right-[-60%]"
          style={{
            bottom: "-10%",
            height: "65%",
            transform: "rotateX(72deg)",
            transformOrigin: "50% 100%",
            backgroundImage: [
              "linear-gradient(rgba(99,102,241,0.14) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(99,102,241,0.14) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "64px 64px",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 28%, black 55%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 28%, black 55%)",
          }}
        />
      </div>

      {/* Radial vignette — pulls focus to the centre */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 18%, rgba(5,5,5,0.5) 65%, rgba(5,5,5,0.88) 100%)",
        }}
      />

      {/* ── Chapter marker (top-left) ── */}
      <motion.div
        className="absolute top-8 left-8 z-[3] pointer-events-none"
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: EASE_APPLE, delay: 1.6 }}
      >
        <p className="text-[0.5rem] tracking-[0.48em] uppercase text-white/22">Chapter 01</p>
        <p className="text-[0.46rem] tracking-[0.32em] uppercase text-indigo-400/45 mt-0.5">Identity</p>
      </motion.div>

      {/* ── Core content ── */}
      <div className="relative z-[2] text-center px-6 flex flex-col items-center">
        {/* Role pill */}
        <motion.p
          className="text-[0.58rem] tracking-[0.5em] uppercase text-white/28 mb-9"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_APPLE, delay: 0.4 }}
        >
          {personal.role}
        </motion.p>

        {/* Name — giant, two-weight split */}
        <motion.h1
          className="font-light leading-[0.88] tracking-[-0.05em] select-none pointer-events-none"
          style={{ fontSize: "clamp(4rem, 14vw, 10.5rem)" }}
          initial={{ opacity: 0, filter: "blur(36px)", y: 44 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.9, ease: EASE_APPLE }}
        >
          {personal.nameShort.split(" ").map((word, i) => (
            <span
              key={word}
              className="block"
              style={{
                fontWeight:    i === 0 ? 200 : 800,
                letterSpacing: i === 0 ? "-0.05em" : "-0.06em",
                background:    i === 1
                  ? "linear-gradient(90deg, #ffffff 0%, #a78bfa 50%, #ffffff 100%)"
                  : undefined,
                backgroundClip:       i === 1 ? "text" : undefined,
                WebkitBackgroundClip: i === 1 ? "text" : undefined,
                WebkitTextFillColor:  i === 1 ? "transparent" : undefined,
              }}
            >
              {word.toUpperCase()}
            </span>
          ))}
        </motion.h1>

        {/* Cycling capability statement — answers "what problems can you solve?" */}
        <motion.div
          className="mt-11 flex flex-wrap items-baseline justify-center gap-x-2 text-[clamp(0.78rem,1.6vw,0.95rem)] font-light text-white/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE_APPLE, delay: 1.1 }}
        >
          <span>I engineer</span>
          <CapabilityTypewriter />
        </motion.div>

        {/* Location divider */}
        <motion.div
          className="mt-9 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE_APPLE, delay: 1.5 }}
        >
          <span className="h-px w-8 bg-white/10" />
          <span className="text-[0.5rem] tracking-[0.42em] uppercase text-white/18">
            {personal.location}
          </span>
          <span className="h-px w-8 bg-white/10" />
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.2 }}
      >
        <span className="text-[0.46rem] tracking-[0.44em] uppercase text-white/16">
          Begin journey
        </span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-indigo-400/35 to-transparent"
          animate={{ y: [0, 10, 0], opacity: [0.6, 0.18, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Available badge (bottom-right) ── */}
      {personal.available && (
        <motion.div
          className="absolute bottom-10 right-8 z-[3] flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/30 backdrop-blur-sm cursor-none"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.1, duration: 0.9, ease: EASE_APPLE }}
          onMouseEnter={() => setCursorVariant("hover")}
          onMouseLeave={() => setCursorVariant("default")}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.5rem] tracking-widest uppercase text-emerald-400/65">
            {personal.availableText}
          </span>
        </motion.div>
      )}
    </section>
  );
}
