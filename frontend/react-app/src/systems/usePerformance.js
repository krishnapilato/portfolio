/**
 * usePerformance — React hook that bridges the PerformanceManager into
 * the component tree.  Monitors FPS each frame and auto-downgrades the
 * quality tier when sustained drops are detected.
 */

import { useEffect, useState } from "react";
import { useAppStore } from "../store/index.js";
import { FPSSampler, shouldDowngrade } from "./PerformanceManager.js";

/** Interval (ms) between quality-check evaluations */
const CHECK_INTERVAL = 3000;

// Module-level sampler — created once, never during render
const _sampler = new FPSSampler(60);

export function usePerformanceMonitor() {
  const tier = useAppStore((s) => s.performanceTier);
  const setTier = useAppStore((s) => s.setPerformanceTier);
  const [sampler] = useState(() => _sampler);

  useEffect(() => {
    let lastCheck = performance.now();
    let rafId;

    const loop = () => {
      sampler.tick();

      const now = performance.now();
      if (now - lastCheck >= CHECK_INTERVAL) {
        lastCheck = now;
        const avg = sampler.getAverageFPS();
        const currentTier = useAppStore.getState().performanceTier;
        const next = shouldDowngrade(currentTier, avg);
        if (next !== currentTier) setTier(next);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [setTier, sampler]);

  return { tier, sampler };
}
