/**
 * HangarPostEffects — lazy-loaded postprocessing for the hangar scene.
 *
 * Split into its own chunk so that the EffectComposer + Bloom imports
 * don't block initial page load.
 */

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { memo } from "react";

function HangarPostEffects({ bloomIntensity = 0.6 }) {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.06}
        intensity={bloomIntensity}
        levels={4}
        mipmapBlur
      />
    </EffectComposer>
  );
}

export default memo(HangarPostEffects);
