import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, SMAAPreset } from "postprocessing";
import { HalfFloatType } from "three";
import { DEFAULT_POST, type PostSettings } from "../lib/grade";
import type { Tier } from "../lib/store";

type Props = { tier: Tier; settings?: PostSettings };

/**
 * The grade, in order: bloom lifts the practicals and the specular hits,
 * depth of field (desktop only: it is the most expensive pass) gives the
 * lens a focal plane, aberration and grain make it feel photographed rather
 * than rendered, the vignette closes the frame, and AgX tone mapping keeps
 * the bright metal from clipping to white. Low tier keeps only what it
 * cannot do without: tone mapping and a vignette.
 */
export default function Post({ tier, settings = DEFAULT_POST }: Props) {
  if (tier === "low") {
    return (
      <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
        <Vignette offset={settings.vignetteOffset} darkness={settings.vignetteDarkness} />
        <ToneMapping mode={settings.toneMapping} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
      <Bloom
        mipmapBlur
        luminanceThreshold={settings.bloomThreshold}
        luminanceSmoothing={0.12}
        intensity={settings.bloomIntensity}
        radius={settings.bloomRadius}
        levels={6}
      />
      {tier === "high" ? (
        <DepthOfField
          focusDistance={settings.dofFocusDistance}
          focalLength={settings.dofFocalLength}
          bokehScale={settings.dofBokehScale}
        />
      ) : (
        <></>
      )}
      <ChromaticAberration
        offset={[settings.aberration, settings.aberration]}
        radialModulation
        modulationOffset={0.4}
      />
      <Noise premultiply opacity={settings.grain} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={settings.vignetteOffset} darkness={settings.vignetteDarkness} />
      <ToneMapping mode={settings.toneMapping} />
      <SMAA preset={tier === "high" ? SMAAPreset.HIGH : SMAAPreset.LOW} />
    </EffectComposer>
  );
}
