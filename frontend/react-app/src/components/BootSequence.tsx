import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type BootSequenceProps = {
  onComplete: () => void;
};

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="boot-sequence"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          aria-label="Initializing experience"
        >
          <motion.p
            className="boot-label"
            initial={{ letterSpacing: "0.8em", opacity: 0.4 }}
            animate={{ letterSpacing: "0.35em", opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            CALIBRATING ARCHIVE
          </motion.p>
          <div className="boot-meter" role="presentation">
            <motion.span
              className="boot-meter-fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.75, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
