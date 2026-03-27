import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/index.js";
import { EASE_APPLE } from "../lib/motionVariants.js";

/**
 * Full-screen cinematic entry sequence — aviation pre-flight theme.
 * Simulates cockpit boot-up, then calls onComplete when ready.
 */

const CHECKLIST = [
  { label: "Navigation systems", delay: 0.6 },
  { label: "Avionics", delay: 1.0 },
  { label: "Flight instruments", delay: 1.5 },
  { label: "Communications", delay: 2.0 },
];

/** Total duration of the pre-flight sequence in seconds */
const PREFLIGHT_DURATION_S = 3.4;

export default function EntrySequence({ onComplete }) {
  const setEntryComplete  = useAppStore((s) => s.setEntryComplete);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);
  const setLoadingProgress = useAppStore((s) => s.setLoadingProgress);
  const [progress, setProgress] = useState(0);

  // Simulated loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 0.02 + Math.random() * 0.03, 1);
        setLoadingProgress(next);
        return next;
      });
    }, 60);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setEntryComplete();
      unlockAchievement("entry", "Pre-flight check complete");
      onComplete?.();
    }, PREFLIGHT_DURATION_S * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [setEntryComplete, unlockAchievement, onComplete, setLoadingProgress]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#050505" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(16px)", scale: 1.04 }}
      transition={{ duration: 1.4, ease: EASE_APPLE }}
    >
      {/* Concentric HUD rings */}
      {[3.5, 5, 6.8, 8.8].map((r, i) => (
        <motion.div
          key={r}
          className="absolute rounded-full border border-indigo-500/10 pointer-events-none"
          style={{ width: `${r * 80}px`, height: `${r * 80}px` }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE_APPLE, delay: 0.1 * i }}
        />
      ))}

      {/* Rotating compass indicator */}
      <motion.div
        className="absolute w-40 h-40 rounded-full pointer-events-none"
        style={{ border: "1px dashed rgba(99,102,241,0.1)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Scan line sweeping top-to-bottom */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
      />

      {/* Core content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Cockpit wing icon */}
        <motion.div
          className="w-16 h-16 flex items-center justify-center border border-white/20 rounded-2xl"
          style={{ boxShadow: "0 0 40px rgba(99,102,241,0.18)" }}
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: EASE_APPLE, delay: 0.2 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
            <path
              d="M12 2L2 12l3 3 7-7 7 7 3-3L12 2z"
              fill="currentColor"
              opacity="0.8"
            />
            <path d="M12 22v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Status text */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_APPLE, delay: 0.5 }}
        >
          <p className="text-[0.58rem] tracking-[0.42em] uppercase text-indigo-400/80 mb-2">
            Pre-flight Systems Check
          </p>
          <p className="text-[0.5rem] tracking-[0.28em] uppercase text-white/20">
            The Flight of Khova · v2025.1
          </p>
        </motion.div>

        {/* Checklist items */}
        <div className="flex flex-col items-start gap-1.5 text-left">
          {CHECKLIST.map((item) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE_APPLE, delay: item.delay }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                initial={{ background: "rgba(99,102,241,0.3)" }}
                animate={{ background: progress > item.delay / PREFLIGHT_DURATION_S ? "rgba(74,222,128,0.8)" : "rgba(99,102,241,0.3)" }}
                transition={{ duration: 0.3 }}
              />
              <span className="text-[0.48rem] tracking-[0.2em] uppercase text-white/30 font-mono">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Loading bar */}
        <motion.div
          className="w-52 h-px bg-white/8 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #6366f1, #a78bfa, #e879f9)",
              width: `${progress * 100}%`,
              transition: "width 0.1s ease-out",
            }}
          />
        </motion.div>

        <motion.p
          className="text-[0.42rem] tracking-[0.3em] uppercase text-white/12 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {Math.round(progress * 100)}% — All systems nominal
        </motion.p>
      </div>
    </motion.div>
  );
}
