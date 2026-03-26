import { motion } from "framer-motion";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import { useAppStore } from "../store/index.js";

const ICONS = {
  mail: "✉",
  github: "⌥",
  linkedin: "⬡",
};

export default function ContactSection({ personal, contacts }) {
  const { ref } = useSectionObserver(6);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 md:py-56 px-6 md:px-16 lg:px-28 overflow-hidden"
    >
      {/* Radial glow bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.016]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <p className="text-[0.58rem] tracking-[0.38em] uppercase text-indigo-400/60 mb-16">
            06 / Final Sequence
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-start">
          {/* Left */}
          <div>
            <Reveal delay={0.1}>
              <h2
                className="font-light leading-[1.06] tracking-[-0.04em] text-white mb-8"
                style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
              >
                Let&apos;s build something{" "}
                <em className="not-italic font-bold">great</em>.
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-[0.9rem] font-light leading-[1.9] text-white/40 max-w-md mb-10">
                Open to freelance projects, full-time opportunities, and
                interesting collaborations. If you have an idea worth building,
                I want to hear it.
              </p>
            </Reveal>

            <Reveal delay={0.28}>
              <MagneticButton
                href={`mailto:${contacts[0]?.value}`}
                onClick={() => unlockAchievement("contact", "Ready to connect!")}
              >
                <span>Start a conversation</span>
                <span className="opacity-50">→</span>
              </MagneticButton>
            </Reveal>
          </div>

          {/* Right: contact links */}
          <Reveal delay={0.25}>
            <div className="flex flex-col divide-y divide-white/[0.07]">
              {contacts.map((c) => (
                <motion.a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-5 group cursor-none"
                  whileHover={{ x: 12 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  onMouseEnter={() => setCursorVariant("hover")}
                  onMouseLeave={() => setCursorVariant("default")}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg text-white/20 group-hover:text-indigo-400 transition-colors duration-300">
                      {ICONS[c.icon] ?? "◎"}
                    </span>
                    <div>
                      <p className="text-[0.58rem] tracking-[0.28em] uppercase text-white/22 mb-0.5">
                        {c.label}
                      </p>
                      <p className="text-[0.85rem] font-light text-white/50 group-hover:text-white/80 transition-colors duration-300">
                        {c.value}
                      </p>
                    </div>
                  </div>
                  <span className="text-white/15 group-hover:text-white/50 transition-colors duration-300 translate-x-0 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </motion.a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Footer */}
        <Reveal delay={0.4}>
          <div className="mt-24 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[0.6rem] tracking-[0.1em] text-white/18">
              © {new Date().getFullYear()} {personal.name}. All rights reserved.
            </p>
            <p className="text-[0.6rem] tracking-[0.1em] text-white/12">
              React 19 · Three.js · Framer Motion · Zustand
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
