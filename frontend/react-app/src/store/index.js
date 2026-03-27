import { create } from "zustand";
import { detectDeviceTier } from "../systems/PerformanceManager.js";

/**
 * Global application state — aviation-themed gamified portfolio.
 *
 * Zones (sections): 0=entry, 1=hero, 2=about, 3=skills, 4=experience, 5=projects, 6=contact
 */
const TOTAL_SECTIONS = 7;

export const useAppStore = create((set, get) => ({
  // ── Navigation ─────────────────────────────────────────────
  currentSection: 0,
  totalSections: TOTAL_SECTIONS,
  setCurrentSection: (index) => set({ currentSection: index }),

  // ── Scroll progress (0–1 within the full page) ──────────────
  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: Math.min(1, Math.max(0, v)) }),

  // ── Loading / Entry ─────────────────────────────────────────
  isLoading: true,
  loadingProgress: 0,
  entryComplete: false,
  setLoading: (v) => set({ isLoading: v }),
  setLoadingProgress: (v) => set({ loadingProgress: Math.min(1, Math.max(0, v)) }),
  setEntryComplete: () => set({ entryComplete: true, isLoading: false }),

  // ── Performance ─────────────────────────────────────────────
  performanceTier: detectDeviceTier(),
  setPerformanceTier: (tier) => set({ performanceTier: tier }),
  showFPS: false,
  setShowFPS: (v) => set({ showFPS: v }),

  // ── Cinematic ───────────────────────────────────────────────
  cinematicActive: false,
  setCinematicActive: (v) => set({ cinematicActive: v }),

  // ── Cursor ──────────────────────────────────────────────────
  cursorVariant: "default",
  cursorLabel: "",
  setCursorVariant: (variant, label = "") =>
    set({ cursorVariant: variant, cursorLabel: label }),

  // ── Gamification ────────────────────────────────────────────
  // Track which sections the user has discovered (aviation: "zones visited")
  discoveredSections: new Set([0]),
  discoverSection: (index) =>
    set((state) => {
      const next = new Set(state.discoveredSections);
      next.add(index);
      return { discoveredSections: next };
    }),
  isDiscovered: (index) => get().discoveredSections.has(index),

  // Achievement system
  achievements: [],
  unlockAchievement: (id, label) =>
    set((state) => {
      if (state.achievements.find((a) => a.id === id)) return state;
      return { achievements: [...state.achievements, { id, label, ts: Date.now() }] };
    }),

  // Easter egg found
  easterEggFound: false,
  findEasterEgg: () => {
    set({ easterEggFound: true });
    get().unlockAchievement("easter_egg", "Hidden manoeuvre discovered!");
  },

  // ── 3D scene state ──────────────────────────────────────────
  activeSkillNode: null,
  setActiveSkillNode: (id) => set({ activeSkillNode: id }),
  activeZone: "hangar", // hangar | cockpit | server-room | ...
  setActiveZone: (zone) => set({ activeZone: zone }),

  // ── Nav state ───────────────────────────────────────────────
  navOpen: false,
  setNavOpen: (v) => set({ navOpen: v }),
}));
