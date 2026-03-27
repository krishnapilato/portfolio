/**
 * FPSCounter — developer-mode overlay that shows current FPS,
 * quality tier, and draw-call count.  Only renders when `showFPS`
 * is true in the store (toggled via ` key).
 */

import { memo, useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/index.js";

function FPSCounter({ sampler }) {
  const [fps, setFps] = useState(60);
  const tier = useAppStore((s) => s.performanceTier);
  const show = useAppStore((s) => s.showFPS);
  const setShowFPS = useAppStore((s) => s.setShowFPS);
  const intervalRef = useRef(null);

  // Toggle with backtick key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "`") setShowFPS(!show);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, setShowFPS]);

  // Update FPS display
  useEffect(() => {
    if (!show || !sampler) return;
    intervalRef.current = setInterval(() => {
      setFps(Math.round(sampler.getAverageFPS()));
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [show, sampler]);

  if (!show) return null;

  const fpsColor = fps >= 55 ? "#4ade80" : fps >= 35 ? "#facc15" : "#f87171";

  return (
    <div
      className="fixed top-2 right-2 z-[9999] font-mono text-[10px] leading-tight px-2 py-1.5 rounded-md pointer-events-none select-none"
      style={{
        background: "rgba(0,0,0,0.7)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ color: fpsColor }}>{fps} FPS</div>
      <div className="text-white/50">Tier: {tier}</div>
    </div>
  );
}

export default memo(FPSCounter);
