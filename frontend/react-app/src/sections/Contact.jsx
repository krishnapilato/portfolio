import { motion } from "framer-motion";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import { EASE_APPLE } from "../lib/motionVariants.js";
import { useAppStore } from "../store/index.js";

const ICONS = {
  mail:     "✉",
  github:   "⌥",
  linkedin: "⬡",
};

export default function ContactSection({ personal, contacts }) {
  const { ref } = useSectionObserver(6);
  const setCursorVariant  = useAppStore((s) => s.setCursorVariant);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  // Derive the email href once, not on every render
  const mailHref = contacts.find((c) => c.icon === "mail")?.href;

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-36 md:py-56 px-6 md:px-16 lg:px-28 min-h-screen flex items-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse 110% 80% at 50% 100%, rgba(99,102,241,0.07) 0%, rgba(5,5,5,0.97) 50%)" }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.014]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Giant background chapter number */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{
          fontSize: "clamp(12rem, 28vw, 22rem)",
          fontWeight: 900,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(99,102,241,0.05)",
          letterSpacing: "-0.07em",
        }}
      >
        06
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {/* Chapter label */}
        <Reveal>
          <div className="flex items-center gap-4 mb-20">
            <span className="h-px w-12 bg-indigo-500/40" />
            <p className="text-[0.55rem] tracking-[0.45em] uppercase text-indigo-400/60">
              Chapter 06 / Final Transmission
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          {/* ── Left: CTA ── */}
          <div>
            <Reveal delay={0.08}>
              <h2
                className="font-extralight leading-[1.03] tracking-[-0.05em] text-white mb-8"
                style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
              >
                Let&apos;s build something{" "}
                <em
                  className="not-italic font-black block"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #e879f9 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  great.
                </em>
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="text-[0.88rem] font-light leading-[1.95] text-white/36 max-w-md mb-12">
                You need an engineer who solves hard problems, ships on time, and
                makes the team around them better. That&apos;s the role I show up for
                every day — let&apos;s talk.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="flex flex-wrap gap-4 items-center">
                <MagneticButton
                  href={mailHref}
                  onClick={() => unlockAchievement("contact", "Ready to connect!")}
                >
                  <span>Start a conversation</span>
                  <span className="opacity-50">→</span>
                </MagneticButton>

                {/* Available indicator */}
                {personal.available && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[0.52rem] tracking-widest uppercase text-emerald-400/65">
                      Currently available
                    </span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* ── Right: contact links ── */}
          <Reveal delay={0.24}>
            <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {contacts.map((c, i) => (
                <motion.a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-6 group cursor-none"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: EASE_APPLE, delay: 0.06 * i }}
                  whileHover={{ x: 14 }}
                  onMouseEnter={() => setCursorVariant("hover")}
                  onMouseLeave={() => setCursorVariant("default")}
                >
                  <div className="flex items-center gap-5">
                    <span className="text-xl text-white/18 group-hover:text-indigo-400 transition-colors duration-300">
                      {ICONS[c.icon] ?? "◎"}
                    </span>
                    <div>
                      <p className="text-[0.54rem] tracking-[0.3em] uppercase text-white/20 mb-0.5">
                        {c.label}
                      </p>
                      <p className="text-[0.85rem] font-light text-white/45 group-hover:text-white/80 transition-colors duration-300">
                        {c.value}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    className="text-white/15 group-hover:text-white/50 transition-colors duration-300"
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    →
                  </motion.span>
                </motion.a>
              ))}
            </div>

            {/* Signature */}
            <Reveal delay={0.4}>
              <div className="mt-14 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-[0.56rem] tracking-[0.12em] text-white/14">
                  © {new Date().getFullYear()} {personal.name} · Built with React 19 &amp; Three.js
                </p>
              </div>
            </Reveal>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
