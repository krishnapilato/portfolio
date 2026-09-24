import {
  Bloom,
  BrightnessContrast,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { BlendFunction, SMAAPreset, type DepthOfFieldEffect } from "postprocessing";
import { useRef } from "react";
import { HalfFloatType } from "three";
import { DEFAULT_POST, type PostSettings } from "../lib/grade";
import type { Tier } from "../lib/store";
import { cameraState } from "./palette";

type Props = { quality: Tier; settings?: PostSettings };

/**
 * The grade, in order: bloom lifts the practicals and the specular hits,
 * depth of field (the high level only: it is the most expensive pass)
 * gives the lens a focal plane, grain makes it feel photographed rather
 * than rendered, the vignette closes the frame, and AgX tone mapping keeps
 * the bright metal from clipping to white. No chromatic aberration: a
 * macro lens on a precision instrument has none, and it is the stock
 * WebGL-demo tell. The low level has no stack at all.
 */
export default function Post({ quality, settings = DEFAULT_POST }: Props) {
  const dof = useRef<DepthOfFieldEffect>(null);

  // The focal plane follows the camera's aim and the aperture follows the
  // lighting track, so each beat has the depth of field it was shot with.
  useFrame(() => {
    const effect = dof.current;
    if (!effect) return;
    const coc = effect.cocMaterial;
    if (Math.abs(coc.worldFocusDistance - cameraState.focusDistance) > 1e-3) {
      coc.worldFocusDistance = cameraState.focusDistance;
    }
    const range = Math.max(0.35, cameraState.focusDistance * 0.35);
    if (Math.abs(coc.worldFocusRange - range) > 1e-3) coc.worldFocusRange = range;
    if (Math.abs(effect.bokehScale - cameraState.bokeh) > 1e-3) effect.bokehScale = cameraState.bokeh;
  });

  return (
    <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
      <Bloom
        mipmapBlur
        luminanceThreshold={settings.bloomThreshold}
        luminanceSmoothing={0.05}
        intensity={settings.bloomIntensity}
        radius={settings.bloomRadius}
        levels={5}
      />
      {quality === "high" ? (
        <DepthOfField
          ref={dof}
          worldFocusDistance={3}
          worldFocusRange={1}
          bokehScale={settings.dofBokehScale}
          resolutionScale={0.5}
        />
      ) : (
        <></>
      )}
      <Noise premultiply opacity={settings.grain} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={settings.vignetteOffset} darkness={settings.vignetteDarkness} />
      <ToneMapping mode={settings.toneMapping} />
      {/* The grade: a touch more contrast, a touch less saturation, so the metals stay silver. */}
      <BrightnessContrast brightness={0.006} contrast={0.06} />
      <HueSaturation saturation={-0.05} />
      <SMAA preset={SMAAPreset.MEDIUM} />
    </EffectComposer>
  );
}
