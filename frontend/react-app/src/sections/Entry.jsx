import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAppStore } from "../store/index.js";
import { EASE_APPLE } from "../lib/motionVariants.js";

/**
 * Full-screen cinematic entry sequence — fades in from black,
 * reveals a minimal loading indicator, then calls onComplete.
 */
export default function EntrySequence({ onComplete }) {
  const setEntryComplete = useAppStore((s) => s.setEntryComplete);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntryComplete();
      unlockAchievement("entry", "System initialised");
      onComplete?.();
    }, 2800);
    return () => clearTimeout(timer);
  }, [setEntryComplete, unlockAchievement, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-void overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 1.2, ease: EASE_APPLE }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-6">
        {/* KP mark */}
        <motion.div
          className="w-16 h-16 flex items-center justify-center border border-white/20 rounded-2xl text-xl font-semibold tracking-wider"
          initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: EASE_APPLE, delay: 0.2 }}
        >
          KP
        </motion.div>

        {/* System text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_APPLE, delay: 0.6 }}
        >
          <p className="text-[0.6rem] tracking-[0.4em] uppercase text-indigo-400/80 mb-3">
            System Initialising
          </p>
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-white/20">
            Portfolio v2025.1
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-48 h-px bg-white/10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut", delay: 0.9 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
