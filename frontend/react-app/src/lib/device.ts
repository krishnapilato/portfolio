import type { Tier } from "./store";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** Renderer strings that mark integrated / software / low-end GPUs. */
const WEAK_GPU =
  /swiftshader|llvmpipe|software|mali-4|mali-t|mali-g5|adreno 3|adreno 4|adreno 5|powervr|intel.*hd graphics [2345]|intel.*uhd 6[0-2]|apple gpu/i;
const STRONG_GPU = /rtx|radeon rx|geforce gtx 1[06]|geforce gtx 20|apple m[1-9]|adreno 7|adreno 8|mali-g7[1-9]|mali-g[89]|immortalis|xe graphics|arc a/i;

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
  let score = 0;
  if (STRONG_GPU.test(p.renderer)) score += 3;
  if (WEAK_GPU.test(p.renderer)) score -= 3;
  if (p.memory >= 8) score += 2;
  else if (p.memory <= 2) score -= 2;
  if (p.cores >= 8) score += 1;
  else if (p.cores <= 4) score -= 1;
  if (p.touch) score -= 1;
  if (p.width < 700) score -= 1;
  if (p.saveData) score -= 3;
  if (score >= 3) return "high";
  if (score <= -3) return "low";
  return "mid";
}

/** Device pixel ratio range per tier; the PerformanceMonitor moves inside it. */
// High stops at 1.5: the grade is soft (bloom, grain, depth of field), so
// 2x buys nothing visible and costs 78% more pixels in every extra pass.
export const DPR_RANGE: Record<Tier, [number, number]> = {
  high: [1, 1.5],
  mid: [1, 1.5],
  low: [0.75, 1],
};
