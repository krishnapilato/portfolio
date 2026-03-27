import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import AchievementToast from "./components/ui/AchievementToast.jsx";
import FPSCounter from "./components/ui/FPSCounter.jsx";
import { useAppStore } from "./store/index.js";
import { usePerformanceMonitor } from "./systems/usePerformance.js";
import "./App.css";

// Lazy-loaded: 3D game world (heaviest chunk)
const GameWorld = lazy(() => import("./scenes/GameWorld.jsx"));
// Lazy-loaded: HUD overlay (HTML panels over canvas)
const GameHUD = lazy(() => import("./components/ui/GameHUD.jsx"));
// Lazy-loaded: entry sequence
const EntrySequence = lazy(() => import("./sections/Entry.jsx"));
// Lazy-loaded: virtual joystick for mobile
const VirtualJoystick = lazy(() => import("./components/ui/VirtualJoystick.jsx"));
// Lazy-loaded: 2D fallback for potato tier
const FallbackPortfolio = lazy(() => import("./components/ui/FallbackPortfolio.jsx"));

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showEntry, setShowEntry] = useState(true);
  const tier = useAppStore((s) => s.performanceTier);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  // Performance monitoring — auto-downgrades tier on sustained FPS drops
  const { sampler } = usePerformanceMonitor();

  // Responsive detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Easter egg: Konami code
  useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let idx = 0;
    const onKey = (e) => {
      if (e.key === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          useAppStore.getState().findEasterEgg();
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Unlock achievement when all zones discovered
  const discoveredSections = useAppStore((s) => s.discoveredSections);
  useEffect(() => {
    if (discoveredSections.size >= 7) {
      unlockAchievement("explorer", "Full flight plan completed!");
    }
  }, [discoveredSections.size, unlockAchievement]);

  // "Potato" tier → show simplified 2D fallback (no WebGL)
  if (tier === "potato") {
    return (
      <Suspense fallback={null}>
        <FallbackPortfolio />
      </Suspense>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-void">
      {/* ── Entry sequence — aviation pre-flight ── */}
      <AnimatePresence>
        {showEntry && (
          <Suspense fallback={null}>
            <EntrySequence onComplete={() => setShowEntry(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* ── Full-screen 3D game world ── */}
      {!showEntry && (
        <>
          <div className="absolute inset-0 z-0">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-void">
                <p className="text-[0.5rem] tracking-[0.3em] uppercase text-white/20">Initializing world…</p>
              </div>
            }>
              <GameWorld isMobile={isMobile} />
            </Suspense>
          </div>

          {/* ── HUD overlay (HTML panels, minimap, hints) ── */}
          <Suspense fallback={null}>
            <GameHUD isMobile={isMobile} />
          </Suspense>

          {/* ── Mobile virtual joystick ── */}
          {isMobile && (
            <Suspense fallback={null}>
              <VirtualJoystick onMove={({ x, y }) => {
                window.dispatchEvent(new CustomEvent("joystick-move", { detail: { x, y } }));
              }} />
            </Suspense>
          )}
        </>
      )}

      {/* ── Performance overlay (toggle with ` key) ── */}
      <FPSCounter sampler={sampler} />

      {/* ── Global overlays ── */}
      <AchievementToast />
    </div>
  );
}
