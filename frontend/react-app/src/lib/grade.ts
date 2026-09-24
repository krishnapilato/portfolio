import { ToneMappingMode } from "postprocessing";

/** Everything the post stack needs, in one place, so the grade is one edit. */
export type PostSettings = {
  bloomThreshold: number;
  bloomIntensity: number;
  bloomRadius: number;
  dofFocusDistance: number;
  dofFocalLength: number;
  dofBokehScale: number;
  vignetteOffset: number;
  vignetteDarkness: number;
  grain: number;
  toneMapping: ToneMappingMode;
};

export const DEFAULT_POST: PostSettings = {
  bloomThreshold: 1.3,
  bloomIntensity: 0.32,
  bloomRadius: 0.6,
  dofFocusDistance: 0.02,
  dofFocalLength: 0.02,
  dofBokehScale: 1.6,
  vignetteOffset: 0.35,
  vignetteDarkness: 0.55,
  grain: 0.035,
  toneMapping: ToneMappingMode.AGX,
};
