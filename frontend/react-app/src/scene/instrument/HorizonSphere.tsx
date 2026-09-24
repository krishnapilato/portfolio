import { useEffect, useMemo } from "react";
import { SphereGeometry } from "three";
import { useTimeline } from "../../lib/store";
import { makeDigitAtlas, makeHorizonMaterial } from "../../textures/horizon";

type Props = {
  /** Sphere radius in scene units; the painting is angular, so it scales with it. */
  radius?: number;
};

/**
 * The horizon sphere of the attitude indicator: sky enamel above, earth
 * enamel below, a white horizon band at the equator and the pitch ladder
 * in the front and back windows, all painted per fragment (see
 * textures/horizon.ts) under a clearcoat that carries the reflections.
 * It sits at the origin of its parent; the gimbal chain rotates the parent.
 */
export default function HorizonSphere({ radius = 1 }: Props) {
  const tier = useTimeline((s) => s.tier);

  const geometry = useMemo(
    () => (tier === "low" ? new SphereGeometry(radius, 48, 32) : new SphereGeometry(radius, 64, 48)),
    [radius, tier],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const enamel = useMemo(() => {
    const atlas = makeDigitAtlas();
    const { material } = makeHorizonMaterial(atlas.texture);
    return { atlas, material };
  }, []);
  useEffect(
    () => () => {
      enamel.material.dispose();
      enamel.atlas.texture.dispose();
    },
    [enamel],
  );

  return <mesh geometry={geometry} material={enamel.material} />;
}
