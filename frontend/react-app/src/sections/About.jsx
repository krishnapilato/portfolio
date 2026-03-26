import { motion } from "framer-motion";
import { useSectionObserver } from "../hooks/useSectionObserver.js";
import Reveal from "../components/ui/Reveal.jsx";
import { useAppStore } from "../store/index.js";

export default function AboutSection({ about, stats }) {
  const { ref } = useSectionObserver(2);
  const setCursorVariant = useAppStore((s) => s.setCursorVariant);

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-16 lg:px-28"
    >
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <Reveal>
          <p className="text-[0.58rem] tracking-[0.38em] uppercase text-indigo-400/60 mb-16">
            02 / System Activation
          </p>
        </Reveal>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-start">
          {/* Left: headline */}
          <div>
            <Reveal delay={0.1}>
              <h2
                className="font-light leading-[1.08] tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
              >
                Engineering{" "}
                <em className="not-italic font-bold">elegant</em>{" "}
                systems at scale.
              </h2>
            </Reveal>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={0.12 * (i + 1)}>
                  <motion.div
                    className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-300 cursor-none"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    onMouseEnter={() => setCursorVariant("hover")}
                    onMouseLeave={() => setCursorVariant("default")}
                  >
                    <p
                      className="font-light tracking-[-0.04em] text-white"
                      style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[0.65rem] tracking-[0.12em] uppercase text-white/35 mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: bio paragraphs */}
          <div className="flex flex-col gap-6">
            {about.map((paragraph, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <p className="text-[0.92rem] font-light leading-[1.9] text-white/48">
                  {paragraph}
                </p>
              </Reveal>
            ))}

            {/* Mindset tags */}
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Precision", "Performance", "Clarity", "Craft", "Systems"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[0.62rem] tracking-widest uppercase text-white/35 border border-white/[0.08] rounded-full bg-white/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
