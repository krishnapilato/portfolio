import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type HeroProps = {
  ready: boolean;
};

const headline = ["Khova", "Krishna", "Pilato"];

export function Hero({ ready }: HeroProps) {
  return (
    <section className="hero section" aria-labelledby="hero-title">
      <p className="eyebrow">Cinematic Portfolio Chronicle</p>
      <h1 id="hero-title" className="hero-title">
        {headline.map((word, index) => (
          <span key={word} className="text-mask word-mask">
            <motion.span
              className="word-reveal"
              initial={{ y: "100%", opacity: 0 }}
              animate={
                ready
                  ? {
                      y: "0%",
                      opacity: 1,
                      transition: {
                        delay: 0.2 + index * 0.14,
                        duration: 0.9,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }
                  : undefined
              }
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.p
        className="hero-copy"
        initial={{ opacity: 0, y: 28 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.75, duration: 0.9, ease: "easeOut" }}
      >
        Java-focused full stack engineer crafting resilient Spring Boot backends,
        data-rich systems, and immersive React interfaces that translate business
        goals into premium digital narratives.
      </motion.p>
      <motion.p
        className="hero-skills"
        initial={{ opacity: 0, y: 22 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.9, duration: 0.9, ease: "easeOut" }}
      >
        Java · Spring Boot · SQL/NoSQL · React · Angular · TypeScript · AWS-ready
        architecture
      </motion.p>
      <motion.div
        className="scroll-prompt"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span>Scroll to begin</span>
        <ChevronDown size={18} aria-hidden="true" />
      </motion.div>
    </section>
  );
}
