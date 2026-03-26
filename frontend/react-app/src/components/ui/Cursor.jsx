import { motion, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/index.js";

/**
 * Custom cursor — follows the mouse with spring physics.
 * Shows a dot + ring. Morphs on hover / text states.
 */
export default function Cursor() {
  const variant = useAppStore((s) => s.cursorVariant);
  const label = useAppStore((s) => s.cursorLabel);
  const isMounted = useRef(false);

  const x = useSpring(0, { stiffness: 600, damping: 40 });
  const y = useSpring(0, { stiffness: 600, damping: 40 });

  // Ring trails slightly behind
  const rx = useSpring(0, { stiffness: 120, damping: 18 });
  const ry = useSpring(0, { stiffness: 120, damping: 18 });

  useEffect(() => {
    isMounted.current = true;
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      rx.set(e.clientX);
      ry.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y, rx, ry]);

  const dotVariants = {
    default: { width: 6, height: 6, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "50%" },
    hover:   { width: 10, height: 10, backgroundColor: "rgba(99,102,241,0.9)", borderRadius: "50%" },
    text:    { width: 4, height: 20, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: "2px" },
    link:    { width: 8, height: 8, backgroundColor: "rgba(99,102,241,1)", borderRadius: "50%" },
  };

  const ringVariants = {
    default: { width: 36, height: 36, borderColor: "rgba(255,255,255,0.18)", opacity: 1 },
    hover:   { width: 56, height: 56, borderColor: "rgba(99,102,241,0.55)", opacity: 1 },
    text:    { width: 28, height: 28, borderColor: "rgba(255,255,255,0.1)",  opacity: 0.6 },
    link:    { width: 48, height: 48, borderColor: "rgba(99,102,241,0.4)",   opacity: 1 },
  };

  const cur = dotVariants[variant] || dotVariants.default;
  const ring = ringVariants[variant] || ringVariants.default;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: y }}
        animate={cur}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />

      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ left: rx, top: ry }}
        animate={ring}
        transition={{ type: "spring", stiffness: 160, damping: 20 }}
      />

      {/* Label */}
      {label && (
        <motion.span
          className="pointer-events-none fixed z-[9999] -translate-x-1/2 translate-y-3 text-[10px] tracking-widest uppercase text-white/60"
          style={{ left: rx, top: ry }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {label}
        </motion.span>
      )}
    </>
  );
}
