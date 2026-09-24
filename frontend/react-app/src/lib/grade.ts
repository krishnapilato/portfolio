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
  aberration: number;
  toneMapping: ToneMappingMode;
};

export const DEFAULT_POST: PostSettings = {
  bloomThreshold: 0.86,
  bloomIntensity: 0.55,
  bloomRadius: 0.62,
  dofFocusDistance: 0.02,
  dofFocalLength: 0.045,
  dofBokehScale: 2.6,
  vignetteOffset: 0.28,
  vignetteDarkness: 0.62,
  grain: 0.045,
  aberration: 0.0007,
  toneMapping: ToneMappingMode.AGX,
};
