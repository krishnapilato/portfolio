import { useMemo, type JSX } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Scanline, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useControls } from 'leva';
import * as THREE from 'three';
import useGameStore from '../store';

export default function PostFX() {
  const tier = useGameStore((s) => s.performanceTier);

  const { bloomIntensity, bloomThreshold, enableChromatic, enableNoise, enableScanline, enableVignette } =
    useControls('Post Effects', {
      bloomIntensity: { value: 1.8, min: 0, max: 6, step: 0.1 },
      bloomThreshold: { value: 0.1, min: 0, max: 1, step: 0.05 },
      enableChromatic: true,
      enableNoise: true,
      enableScanline: true,
      enableVignette: true,
    });

  const chromaticOffset = useMemo(() => new THREE.Vector2(0.0015, 0.0015), []);

  if (tier === 'low') return null;

  const isHigh = tier === 'high';

  // Build the effects list, always including at least Bloom so EffectComposer is never empty
  const effects: JSX.Element[] = [
    <Bloom
      key="bloom"
      intensity={bloomIntensity}
      luminanceThreshold={bloomThreshold}
      luminanceSmoothing={0.9}
      mipmapBlur
    />,
  ];

  if (isHigh && enableChromatic) {
    effects.push(
      <ChromaticAberration
        key="ca"
        offset={chromaticOffset}
        blendFunction={BlendFunction.NORMAL}
      />,
    );
  }
  if (enableNoise) {
    effects.push(
      <Noise key="noise" opacity={0.04} blendFunction={BlendFunction.ADD} />,
    );
  }
  if (isHigh && enableScanline) {
    effects.push(
      <Scanline key="scan" density={1.4} opacity={0.08} blendFunction={BlendFunction.OVERLAY} />,
    );
  }
  if (enableVignette) {
    effects.push(
      <Vignette key="vignette" offset={0.3} darkness={0.7} blendFunction={BlendFunction.NORMAL} />,
    );
  }

  return <EffectComposer>{effects}</EffectComposer>;
}
