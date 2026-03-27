/**
 * PerformanceManager — adaptive quality system for the 3D portfolio.
 *
 * Detects device capabilities and monitors real-time FPS.
 * When sustained frame drops are detected the quality tier is lowered
 * automatically, reducing pixel-ratio, shadow quality and post-processing
 * so the experience remains smooth on mid-range and low-end hardware.
 *
 * Tiers:
 *   "high"   → full effects, max DPR, shadows on
 *   "medium" → reduced DPR, lighter bloom, fewer particles
 *   "low"    → minimal effects, DPR 1, no shadows
 *   "potato" → 3D disabled, DOM-only fallback
 */

const TIER_ORDER = ["high", "medium", "low", "potato"];

const TIER_CONFIGS = {
  high: {
    dpr: [1, 2],
    shadows: true,
    bloom: true,
    bloomIntensity: 0.6,
    particleCount: 2000,
    antialias: true,
    postprocessing: true,
  },
  medium: {
    dpr: [1, 1.5],
    shadows: false,
    bloom: true,
    bloomIntensity: 0.35,
    particleCount: 1000,
    antialias: false,
    postprocessing: true,
  },
  low: {
    dpr: [1, 1],
    shadows: false,
    bloom: false,
    bloomIntensity: 0,
    particleCount: 400,
    antialias: false,
    postprocessing: false,
  },
  potato: {
    dpr: [1, 1],
    shadows: false,
    bloom: false,
    bloomIntensity: 0,
    particleCount: 0,
    antialias: false,
    postprocessing: false,
  },
};

/**
 * Detect initial device tier based on hardware signals.
 * This runs once at startup; the FPS monitor may downgrade later.
 */
export function detectDeviceTier() {
  if (typeof window === "undefined") return "medium";

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && window.innerWidth < 768);

  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 4; // GB, Chrome-only
  const gpu = getGPUTier();

  if (isMobile && (cores <= 4 || memory <= 2)) return "low";
  if (isMobile) return "medium";
  if (cores >= 8 && memory >= 8 && gpu !== "low") return "high";
  if (cores >= 4 && memory >= 4) return "medium";
  return "low";
}

function getGPUTier() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "low";

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase();
      if (/nvidia|radeon rx [5-9]|apple m[2-9]|apple gpu/i.test(renderer)) return "high";
      if (/intel (iris|uhd)|radeon/i.test(renderer)) return "medium";
    }
    return "medium";
  } catch {
    return "medium";
  }
}

/**
 * FPS sampler — call `tick()` each frame, `getAverageFPS()` returns the
 * rolling average over the last ~60 frames.
 */
export class FPSSampler {
  constructor(sampleSize = 60) {
    this._times = new Float64Array(sampleSize);
    this._idx = 0;
    this._count = 0;
    this._last = performance.now();
  }

  tick() {
    const now = performance.now();
    const delta = now - this._last;
    this._last = now;
    if (delta > 0) {
      this._times[this._idx] = delta;
      this._idx = (this._idx + 1) % this._times.length;
      if (this._count < this._times.length) this._count++;
    }
  }

  getAverageFPS() {
    if (this._count === 0) return 60;
    let sum = 0;
    for (let i = 0; i < this._count; i++) sum += this._times[i];
    return 1000 / (sum / this._count);
  }
}

/**
 * Determine if the tier should be downgraded based on sustained FPS drops.
 * Returns the new tier (may be the same as current).
 */
export function shouldDowngrade(currentTier, avgFPS) {
  const idx = TIER_ORDER.indexOf(currentTier);
  if (idx >= TIER_ORDER.length - 1) return currentTier; // already lowest
  if (avgFPS < 28) return TIER_ORDER[Math.min(idx + 2, TIER_ORDER.length - 1)];
  if (avgFPS < 40) return TIER_ORDER[idx + 1];
  return currentTier;
}

/**
 * Get the configuration object for a given tier.
 */
export function getTierConfig(tier) {
  return TIER_CONFIGS[tier] || TIER_CONFIGS.medium;
}

export { TIER_ORDER, TIER_CONFIGS };
