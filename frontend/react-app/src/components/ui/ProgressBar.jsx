import { motion } from "framer-motion";
import { useAppStore } from "../../store/index.js";

/**
 * Thin progress bar at the very top of the viewport.
 * (Section-dot sidebar has been intentionally removed — keep the experience
 *  fully immersive with no static navigation chrome.)
 */
export default function ProgressBar() {
  const progress = useAppStore((s) => s.scrollProgress);

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[200] h-[2px] bg-white/5">
      <motion.div
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
        style={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
