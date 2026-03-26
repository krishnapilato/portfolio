import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { cn } from "../../lib/cn.js";
import { useAppStore } from "../../store/index.js";

/**
 * A button that magnetically pulls toward the cursor when hovered.
 */
export default function MagneticButton({ children, className, onClick, href, strength = 0.35, ...props }) {
  const ref = useRef(null);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const onMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
    setCursorVariant("default");
  };

  const onMouseEnter = () => setCursorVariant("hover");

  const Tag = href ? "a" : "button";

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <Tag
        href={href}
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-widest uppercase",
          "rounded-full border transition-colors duration-300 cursor-none select-none",
          "border-white/15 text-white/70 hover:border-indigo-500/60 hover:text-white",
          "bg-white/[0.03] hover:bg-indigo-500/10",
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
