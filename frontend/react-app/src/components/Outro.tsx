import { motion } from "framer-motion";

export function Outro() {
  return (
    <motion.footer
      className="outro section"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="outro-label">The Resolution</p>
      <h2>Engineering stories that scale with people, systems, and vision.</h2>
      <p>
        Open to high-impact teams building meaningful products through thoughtful
        design and robust architecture.
      </p>
    </motion.footer>
  );
}
