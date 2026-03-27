/**
 * GameHUD.jsx — HTML overlay system for the 3D game world.
 *
 * Shows:
 *   - Mini-map / compass
 *   - Zone info panels when near a zone marker
 *   - Navigation hints
 *   - Player stats (speed, position)
 *
 * Panels display portfolio content (About, Skills, Experience, etc.)
 * as overlays on top of the 3D canvas, Bruno Simon-style.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "../../store/index.js";
import { EASE_APPLE } from "../../lib/motionVariants.js";
import content from "../../data/content.json";

// ── Zone panel content builders ───────────────────────────

function AboutPanel({ onClose }) {
  return (
    <PanelWrapper title="Pilot Profile" chapter="02" color="#6366f1" onClose={onClose}>
      <div className="space-y-4">
        {content.about.map((p, i) => (
          <p key={i} className="text-[0.8rem] font-light leading-[1.85] text-white/50">
            {p}
          </p>
        ))}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {content.stats.map((s) => (
            <div key={s.label} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xl font-light text-white">{s.value}</p>
              <p className="text-[0.55rem] tracking-widest uppercase text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PanelWrapper>
  );
}

function SkillsPanel({ onClose }) {
  const [cat, setCat] = useState("backend");
  const groups = Object.entries(content.skills);
  const items = content.skills[cat] || [];

  return (
    <PanelWrapper title="Flight Instruments" chapter="03" color="#a78bfa" onClose={onClose}>
      <div className="flex flex-wrap gap-2 mb-5">
        {groups.map(([key]) => (
          <button
            key={key}
            onClick={() => setCat(key)}
            className="px-3 py-1 text-[0.55rem] tracking-widest uppercase rounded-full border transition-all"
            style={{
              borderColor: cat === key ? "#a78bfa60" : "rgba(255,255,255,0.08)",
              color: cat === key ? "#a78bfa" : "rgba(255,255,255,0.3)",
              background: cat === key ? "#a78bfa12" : "transparent",
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <span className="text-[0.7rem] text-white/40 w-28 flex-shrink-0">{s.name}</span>
            <div className="flex-1 h-px bg-white/[0.06] relative overflow-hidden rounded-full">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-violet-400"
                initial={{ width: 0 }}
                animate={{ width: `${s.level}%` }}
                transition={{ duration: 0.8, ease: EASE_APPLE }}
              />
            </div>
            <span className="text-[0.55rem] font-mono text-white/20 w-8 text-right">{s.level}%</span>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function ExperiencePanel({ onClose }) {
  const [active, setActive] = useState(0);
  const exp = content.experience[active];

  return (
    <PanelWrapper title="Flight Log" chapter="04" color="#06b6d4" onClose={onClose}>
      <div className="flex flex-wrap gap-2 mb-5">
        {content.experience.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setActive(i)}
            className="px-2.5 py-1 text-[0.52rem] tracking-wider uppercase rounded-full border transition-all"
            style={{
              borderColor: i === active ? "#06b6d460" : "rgba(255,255,255,0.06)",
              color: i === active ? "#06b6d4" : "rgba(255,255,255,0.25)",
              background: i === active ? "#06b6d410" : "transparent",
            }}
          >
            {e.company}
          </button>
        ))}
      </div>
      <h3 className="text-lg font-light text-white mb-1">{exp.role}</h3>
      <p className="text-[0.7rem] text-white/30 mb-4">{exp.company} · {exp.period}</p>
      <p className="text-[0.78rem] font-light text-white/40 leading-relaxed mb-4">{exp.description}</p>
      <div className="space-y-2">
        {exp.highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-cyan-400/60 mt-0.5">◎</span>
            <p className="text-[0.72rem] text-white/40 leading-relaxed">{h}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {exp.stack.map((t) => (
          <span key={t} className="px-2 py-0.5 text-[0.52rem] text-white/25 border border-white/[0.06] rounded-full">{t}</span>
        ))}
      </div>
    </PanelWrapper>
  );
}

function ProjectsPanel({ onClose }) {
  return (
    <PanelWrapper title="Completed Missions" chapter="05" color="#e879f9" onClose={onClose}>
      <div className="space-y-4">
        {content.projects.map((p) => (
          <div key={p.id} className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-fuchsia-500/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[0.5rem] tracking-widest uppercase font-mono" style={{ color: `${p.color}80` }}>{p.num}</p>
                <h4 className="text-[0.9rem] font-light text-white">{p.title}</h4>
              </div>
              <span className="text-[0.48rem] tracking-widest uppercase px-2 py-0.5 border rounded-full" style={{ borderColor: `${p.color}30`, color: `${p.color}70` }}>
                {p.status}
              </span>
            </div>
            <p className="text-[0.72rem] font-light text-white/35 leading-relaxed mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1">
              {p.tech.slice(0, 4).map((t) => (
                <span key={t} className="px-2 py-0.5 text-[0.5rem] text-white/20 border border-white/[0.05] rounded-full">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function ContactPanel({ onClose }) {
  return (
    <PanelWrapper title="Control Tower" chapter="06" color="#10b981" onClose={onClose}>
      <h3
        className="text-xl font-extralight text-white mb-4 leading-tight"
      >
        Let&apos;s build something{" "}
        <em className="not-italic font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa, #e879f9)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          great.
        </em>
      </h3>
      <p className="text-[0.78rem] font-light text-white/35 leading-relaxed mb-6">
        You need an engineer who solves hard problems, ships on time, and makes the team better.
      </p>
      <div className="space-y-3">
        {content.contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-3 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all group"
          >
            <div>
              <p className="text-[0.5rem] tracking-widest uppercase text-white/20">{c.label}</p>
              <p className="text-[0.78rem] font-light text-white/50 group-hover:text-white/80 transition-colors">{c.value}</p>
            </div>
            <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
          </a>
        ))}
      </div>
      {content.personal.available && (
        <div className="flex items-center gap-2 mt-5 px-3 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.5rem] tracking-widest uppercase text-emerald-400/65">Currently available</span>
        </div>
      )}
    </PanelWrapper>
  );
}

// ── Reusable panel wrapper ────────────────────────────────

function PanelWrapper({ title, chapter, color, onClose, children }) {
  return (
    <motion.div
      className="fixed right-4 top-4 bottom-4 w-[min(420px,calc(100vw-2rem))] z-50 flex flex-col rounded-3xl border bg-void/90 backdrop-blur-xl overflow-hidden"
      style={{ borderColor: `${color}25` }}
      initial={{ x: 460, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 460, opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE_APPLE }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: `${color}15` }}>
        <div>
          <p className="text-[0.45rem] tracking-[0.4em] uppercase" style={{ color: `${color}80` }}>
            Chapter {chapter}
          </p>
          <h2 className="text-sm font-light text-white tracking-wide">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/20 transition-all text-xs"
        >
          ✕
        </button>
      </div>

      {/* Content (scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {children}
      </div>

      {/* Footer hint */}
      <div className="p-3 text-center border-t" style={{ borderColor: `${color}10` }}>
        <p className="text-[0.42rem] tracking-widest uppercase text-white/15">
          Press ESC or fly away to close
        </p>
      </div>
    </motion.div>
  );
}

// ── Zone panel map ────────────────────────────────────────

const ZONE_PANELS = {
  about: AboutPanel,
  skills: SkillsPanel,
  experience: ExperiencePanel,
  projects: ProjectsPanel,
  contact: ContactPanel,
};

// ── MiniMap ───────────────────────────────────────────────

function MiniMap() {
  const { playerX, playerZ } = useAppStore((s) => ({
    playerX: s.playerX,
    playerZ: s.playerZ,
  }));

  const ZONES_DATA = [
    { id: "about",      x: 0,  z: -35, color: "#6366f1" },
    { id: "skills",     x: 35, z: 0,   color: "#a78bfa" },
    { id: "experience", x: 25, z: 30,  color: "#06b6d4" },
    { id: "projects",   x: -25, z: 30, color: "#e879f9" },
    { id: "contact",    x: -35, z: 0,  color: "#10b981" },
  ];

  const scale = 0.6; // px per world unit

  return (
    <div className="fixed bottom-4 left-4 z-40 w-28 h-28 rounded-2xl border border-white/[0.08] bg-void/80 backdrop-blur-md overflow-hidden">
      <div className="relative w-full h-full">
        {/* Zone dots */}
        {ZONES_DATA.map((z) => (
          <div
            key={z.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: z.color,
              opacity: 0.6,
              left: `${50 + z.x * scale}%`,
              top: `${50 + z.z * scale}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Player dot */}
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-white border border-white/50"
          style={{
            left: `${50 + (playerX || 0) * scale}%`,
            top: `${50 + (playerZ || 0) * scale}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 6px rgba(255,255,255,0.5)",
          }}
        />

        {/* Center cross */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-3 bg-white/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-px w-3 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// ── Navigation hint (bottom center) ───────────────────────

function NavHint({ isMobile }) {
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full border border-white/[0.08] bg-void/70 backdrop-blur-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <p className="text-[0.48rem] tracking-[0.2em] uppercase text-white/30">
        {isMobile ? "Use joystick to fly · Tap zones to explore" : "WASD to fly · Approach zones to explore · ESC to close"}
      </p>
    </motion.div>
  );
}

// ── Main HUD export ───────────────────────────────────────

export default function GameHUD({ isMobile }) {
  const activeZone = useAppStore((s) => s.activeZone);
  const [dismissed, setDismissed] = useState(null); // stores zone id that was dismissed

  // Panel is shown when: zone is active AND it has a panel AND user hasn't dismissed this exact zone
  // dismissed resets automatically: when activeZone changes to something new, dismissed won't match
  const showPanel = activeZone && ZONE_PANELS[activeZone] && dismissed !== activeZone;
  const PanelComponent = showPanel ? ZONE_PANELS[activeZone] : null;

  // Close on ESC (event listener)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        const zone = useAppStore.getState().activeZone;
        if (zone) setDismissed(zone);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onClose = useCallback(() => {
    const zone = useAppStore.getState().activeZone;
    if (zone) setDismissed(zone);
  }, []);

  return (
    <>
      {/* Hero overlay (always visible) */}
      <div className="fixed top-4 left-4 z-40 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p className="text-[0.45rem] tracking-[0.5em] uppercase text-white/20 mb-0.5">
            {content.personal.role}
          </p>
          <h1 className="text-lg font-light text-white tracking-tight">
            {content.personal.nameShort}
          </h1>
          <p className="text-[0.5rem] tracking-widest uppercase text-indigo-400/40 mt-0.5">
            {content.personal.tagline}
          </p>
        </motion.div>
      </div>

      <MiniMap />
      <NavHint isMobile={isMobile} />

      {/* Zone panels */}
      <AnimatePresence mode="wait">
        {PanelComponent && <PanelComponent key={activeZone} onClose={onClose} />}
      </AnimatePresence>
    </>
  );
}
