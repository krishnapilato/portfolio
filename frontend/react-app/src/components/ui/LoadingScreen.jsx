/**
 * LoadingScreen — aviation-themed asset loading overlay.
 *
 * Shows a stylised cockpit HUD with progress bar while critical
 * assets are being prepared.  Fades out when loading completes.
 */

import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import { EASE_APPLE } from "../../lib/motionVariants.js";

function LoadingScreen({ progress = 0, visible = true }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[600] flex flex-col items-center justify-center"
          style={{ background: "#050505" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 1.2, ease: EASE_APPLE }}
        >
          {/* Concentric HUD rings */}
          {[3, 5, 7.5].map((r, i) => (
            <motion.div
              key={r}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${r * 60}px`,
                height: `${r * 60}px`,
                border: "1px solid rgba(99,102,241,0.08)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: EASE_APPLE, delay: 0.1 * i }}
            />
          ))}

          {/* Rotating compass ring */}
          <motion.div
            className="absolute w-48 h-48 rounded-full pointer-events-none"
            style={{ border: "1px dashed rgba(99,102,241,0.12)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          />

          {/* Core content */}
          <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
            {/* Altitude indicator icon */}
            <motion.div
              className="w-14 h-14 flex items-center justify-center rounded-2xl"
              style={{
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 0 40px rgba(99,102,241,0.15)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_APPLE, delay: 0.2 }}
            >
              {/* Simple wing SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                <path
                  d="M12 2L2 12l3 3 7-7 7 7 3-3L12 2z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path d="M12 22v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_APPLE, delay: 0.5 }}
            >
              <p className="text-[0.58rem] tracking-[0.42em] uppercase text-indigo-400/70 mb-1">
                Pre-flight Systems Check
              </p>
              <p className="text-[0.48rem] tracking-[0.28em] uppercase text-white/18">
                Loading Aviation Portfolio
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-56 h-[2px] overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #6366f1, #a78bfa, #e879f9)",
                  width: `${Math.min(progress * 100, 100)}%`,
                  transition: "width 0.3s ease-out",
                }}
              />
            </motion.div>

            <motion.p
              className="text-[0.44rem] tracking-[0.3em] uppercase text-white/12 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {Math.round(progress * 100)}% — Systems online
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(LoadingScreen);
