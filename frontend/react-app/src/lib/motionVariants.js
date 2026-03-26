/**
 * Shared Framer Motion variants and easing constants.
 */

export const EASE_APPLE = [0.16, 1, 0.3, 1];
export const EASE_SPRING = { type: "spring", stiffness: 260, damping: 24 };
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/** Standard fade-up reveal */
export const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_APPLE, delay },
  }),
};

/** Stagger container */
export const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Fade-in only */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, ease: EASE_APPLE, delay },
  }),
};

/** Scale pop */
export const scalePop = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_APPLE, delay },
  }),
};

/** Slide in from left */
export const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE_APPLE, delay },
  }),
};

/** Slide in from right */
export const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE_APPLE, delay },
  }),
};
