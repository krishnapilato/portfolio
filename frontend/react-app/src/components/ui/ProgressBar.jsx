import { motion } from "framer-motion";
import { useAppStore } from "../../store/index.js";

const SECTION_LABELS = ["Entry", "Identity", "About", "Skills", "Experience", "Projects", "Contact"];

/**
 * Thin progress bar at the very top + section dots on the right edge.
 */
export default function ProgressBar() {
  const progress = useAppStore((s) => s.scrollProgress);
  const current = useAppStore((s) => s.currentSection);
  const discovered = useAppStore((s) => s.discoveredSections);

  return (
    <>
      {/* Top linear progress */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-[200] h-[2px] bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Right-side section dots */}
      <div className="pointer-events-none fixed right-5 top-1/2 z-[200] -translate-y-1/2 flex flex-col gap-3">
        {SECTION_LABELS.map((label, i) => (
          <div key={label} className="relative flex items-center justify-end gap-2 group">
            {/* Label tooltip */}
            <span className="text-[9px] tracking-widest uppercase text-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-1">
              {label}
            </span>

            <motion.div
              className="rounded-full border"
              animate={{
                width:  i === current ? 16 : 4,
                height: 4,
                backgroundColor: i === current
                  ? "rgba(99,102,241,1)"
                  : discovered.has(i)
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(255,255,255,0.1)",
                borderColor: i === current ? "rgba(99,102,241,0.5)" : "transparent",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
