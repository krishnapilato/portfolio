import type { Tier } from "./store";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * Renderer strings. "Strong" is a discrete GPU or an Apple M-series chip:
 * only those get the full effect stack. Every integrated laptop GPU (Intel
 * HD, UHD, Iris and Xe; AMD's Ryzen "Radeon Graphics" and Vega) is "weak"
 * here on purpose: they run the mid level well and the high level badly,
 * and a laptop is where most visitors will watch this film.
 */
const WEAK_GPU =
  /swiftshader|llvmpipe|software|mesa|mali-4|mali-t|mali-g5|adreno 3|adreno 4|adreno 5|adreno 6|powervr|intel|iris|xe graphics|radeon\(tm\) graphics|radeon graphics|radeon vega|vega [0-9]|apple gpu/i;
const STRONG_GPU = /rtx|geforce gtx|radeon rx|radeon pro|arc a|arc b|apple m[1-9]|adreno 7|adreno 8|mali-g7[1-9]|mali-g[89]|immortalis/i;

export type Probe = {
  webgl: boolean;
  renderer: string;
  memory: number;
  cores: number;
  dpr: number;
  touch: boolean;
  saveData: boolean;
  reducedMotion: boolean;
  width: number;
};

/** Reads everything the tier decision needs, once, from the visitor's device. */
export function probeDevice(): Probe {
  const nav = navigator as NavigatorExtras;
  let webgl = false;
  let renderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ??
      null;
    if (gl) {
      webgl = true;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = info
        ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
        : String(gl.getParameter(gl.RENDERER));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl = false;
  }
  return {
    webgl,
    renderer,
    memory: nav.deviceMemory ?? 4,
    cores: nav.hardwareConcurrency ?? 4,
    dpr: window.devicePixelRatio || 1,
    touch: window.matchMedia("(hover: none) and (pointer: coarse)").matches,
    saveData: Boolean(nav.connection?.saveData),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    width: window.innerWidth,
  };
}

/**
 * Three tiers, decided from a score rather than a single signal, so one
 * misleading value (a phone that reports 8 cores, a laptop on battery
 * saver) cannot push the visitor into the wrong bucket on its own.
 */
export function decideTier(p: Probe): Tier {
  if (!p.webgl) return "low";
  // A strong renderer is the only way up: cores and memory say nothing
  // about a GPU, and they used to push every eight-core laptop to "high".
  const strong = STRONG_GPU.test(p.renderer) && !WEAK_GPU.test(p.renderer);
  let score = strong ? 3 : 0;
  if (WEAK_GPU.test(p.renderer)) score -= 2;
  if (p.memory <= 2) score -= 2;
  if (p.cores <= 4) score -= 1;
  if (p.touch) score -= 1;
  if (p.width < 700) score -= 1;
  if (p.saveData) score -= 3;
  if (strong && score >= 2) return "high";
  if (score <= -3) return "low";
  return "mid";
}

/** Device pixel ratio range per tier; the PerformanceMonitor moves inside it. */
// High stops at 1.5: the grade is soft (bloom, grain, depth of field), so
// 2x buys nothing visible and costs 78% more pixels in every extra pass.
export const DPR_RANGE: Record<Tier, [number, number]> = {
  high: [1, 1.5],
  mid: [1, 1.25],
  low: [0.75, 1],
};
