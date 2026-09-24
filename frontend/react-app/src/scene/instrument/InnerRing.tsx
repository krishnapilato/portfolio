import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { useTimeline } from "../../lib/store";
import { getInstrumentMaterials } from "../../textures/instrument";
import { makeRing } from "./geometry";
import { INNER_RING, LATHE_SEGMENTS } from "./layout";

type Props = ThreeElements["group"];

/**
 * Pitch gimbal: the ring the horizon sphere hangs in, turned from one piece
 * of aluminium with its axis on +Z. The parent rotates the group (pitch
 * about X through the pivot pins, plus the case yaw).
 */
export default function InnerRing(props: Props) {
  const tier = useTimeline((s) => s.tier);
  const materials = useMemo(() => getInstrumentMaterials(tier), [tier]);
  const geometry = useMemo(() => makeRing(INNER_RING, { segments: LATHE_SEGMENTS[tier] }), [tier]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group {...props}>
      <mesh geometry={geometry} material={materials.aluminiumRadial} />
    </group>
  );
}
