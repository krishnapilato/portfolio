import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/index.js";

/**
 * Toasts that pop in when an achievement is unlocked.
 */
export default function AchievementToast() {
  const achievements = useAppStore((s) => s.achievements);
  const [visible, setVisible] = useState([]);
  const prevLen = useRef(0);

  useEffect(() => {
    if (achievements.length <= prevLen.current) return;
    const latest = achievements[achievements.length - 1];
    prevLen.current = achievements.length;

    // Defer setState out of the render/effect sync path
    const show = setTimeout(() => setVisible((prev) => [...prev, latest]), 0);
    const hide = setTimeout(
      () => setVisible((prev) => prev.filter((a) => a.id !== latest.id)),
      3200,
    );
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [achievements]);

  return (
    <div className="pointer-events-none fixed bottom-8 left-8 z-[300] flex flex-col gap-3">
      <AnimatePresence>
        {visible.map((a) => (
          <motion.div
            key={a.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-500/30 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-indigo-400 text-base">⬡</span>
            <div>
              <p className="text-[10px] font-medium tracking-widest uppercase text-indigo-400">Achievement</p>
              <p className="text-xs text-white/70">{a.label}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
