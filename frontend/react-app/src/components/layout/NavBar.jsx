import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAppStore } from "../../store/index.js";
import { EASE_APPLE } from "../../lib/motionVariants.js";

const NAV_ITEMS = [
  { label: "Identity",    id: "hero" },
  { label: "About",       id: "about" },
  { label: "Skills",      id: "skills" },
  { label: "Experience",  id: "experience" },
  { label: "Projects",    id: "projects" },
  { label: "Contact",     id: "contact" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goto = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[150] flex items-center justify-between px-8 py-4 md:px-12"
      style={{
        background: scrolled ? "rgba(5,5,5,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease",
      }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE_APPLE, delay: 0.5 }}
    >
      {/* Logo */}
      <button
        className="flex items-center gap-3 cursor-none group"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onMouseEnter={() => setCursorVariant("hover")}
        onMouseLeave={() => setCursorVariant("default")}
      >
        <span className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold tracking-wider border border-white/25 rounded-lg text-white group-hover:border-indigo-500/60 transition-colors duration-300">
          KP
        </span>
        <span className="hidden sm:block text-[0.62rem] font-light tracking-[0.22em] uppercase text-white/50 group-hover:text-white/80 transition-colors duration-300">
          Krishna Pilato
        </span>
      </button>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-10">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => goto(item.id)}
            className="text-[0.62rem] font-normal tracking-[0.2em] uppercase text-white/35 hover:text-white transition-colors duration-200 cursor-none"
            onMouseEnter={() => setCursorVariant("hover")}
            onMouseLeave={() => setCursorVariant("default")}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-[5px] p-2 cursor-none"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        onMouseEnter={() => setCursorVariant("hover")}
        onMouseLeave={() => setCursorVariant("default")}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-px bg-white"
            animate={{
              width: i === 2 ? (open ? 24 : 14) : 24,
              rotate: open && i === 0 ? 45 : open && i === 1 ? -45 : 0,
              y: open && i === 0 ? 6 : open && i === 1 ? -6 : 0,
              opacity: open && i === 2 ? 0 : 1,
            }}
            transition={{ duration: 0.3, ease: EASE_APPLE }}
          />
        ))}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/[0.07] py-8 px-8 flex flex-col gap-7"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_APPLE }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goto(item.id)}
                className="text-left text-sm font-light tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
