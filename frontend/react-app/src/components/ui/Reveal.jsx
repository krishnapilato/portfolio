import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp } from "../../lib/motionVariants.js";
import { cn } from "../../lib/cn.js";

/**
 * Wraps section content with a standard scroll-reveal animation.
 */
export default function Reveal({ children, delay = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
