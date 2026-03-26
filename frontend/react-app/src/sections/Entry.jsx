import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAppStore } from "../store/index.js";
import { EASE_APPLE } from "../lib/motionVariants.js";

/**
 * Full-screen cinematic entry sequence.
 * Fades from black, shows an initialisation loader, then calls onComplete.
 */
export default function EntrySequence({ onComplete }) {
  const setEntryComplete  = useAppStore((s) => s.setEntryComplete);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntryComplete();
      unlockAchievement("entry", "System initialised");
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [setEntryComplete, unlockAchievement, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#050505" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(16px)", scale: 1.04 }}
      transition={{ duration: 1.4, ease: EASE_APPLE }}
    >
      {/* Tunnel glimpse — concentric rings fading in */}
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

      {/* Scan line sweeping top-to-bottom */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
      />

      {/* Core content */}
      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-6">
        {/* KP monogram */}
        <motion.div
          className="w-16 h-16 flex items-center justify-center border border-white/20 rounded-2xl text-xl font-semibold tracking-wider"
          style={{
            boxShadow: "0 0 40px rgba(99,102,241,0.18)",
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: EASE_APPLE, delay: 0.2 }}
        >
          KP
        </motion.div>

        {/* Status text */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_APPLE, delay: 0.7 }}
        >
          <p className="text-[0.58rem] tracking-[0.42em] uppercase text-indigo-400/80 mb-2">
            Initialising Flight Systems
          </p>
          <p className="text-[0.5rem] tracking-[0.28em] uppercase text-white/20">
            Portfolio · v2025.1
          </p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="w-52 h-px bg-white/8 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa, #e879f9)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
