import { create } from "zustand";
import { detectDeviceTier } from "../systems/PerformanceManager.js";

/**
 * Global application state — aviation-themed 3D game portfolio.
 *
 * The player flies an airplane around a 3D world and approaches
 * zone markers to view portfolio sections as overlay panels.
 *
 * Zones: about | skills | experience | projects | contact
 */
const TOTAL_SECTIONS = 7;

export const useAppStore = create((set, get) => ({
  // ── Navigation ─────────────────────────────────────────────
  currentSection: 0,
  totalSections: TOTAL_SECTIONS,
  setCurrentSection: (index) => set({ currentSection: index }),

  // ── Scroll progress (kept for compatibility) ────────────────
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

  // ── Player position (updated by Airplane each frame) ────────
  playerX: 0,
  playerY: 0,
  playerZ: 0,
  setPlayerPosition: (x, y, z) => set({ playerX: x, playerY: y, playerZ: z }),

  // ── Cursor ──────────────────────────────────────────────────
  cursorVariant: "default",
  cursorLabel: "",
  setCursorVariant: (variant, label = "") =>
    set({ cursorVariant: variant, cursorLabel: label }),

  // ── Gamification ────────────────────────────────────────────
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
  activeZone: null, // null | about | skills | experience | projects | contact
  setActiveZone: (zone) => set({ activeZone: zone }),

  // ── Nav state ───────────────────────────────────────────────
  navOpen: false,
  setNavOpen: (v) => set({ navOpen: v }),
}));
