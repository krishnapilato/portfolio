import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { MathUtils, type BufferGeometry } from "three";
import { useTimeline } from "../../lib/store";
import type { Tier } from "../../lib/store";
import { getInstrumentMaterials } from "../../textures/instrument";
import { cylinderProfile, makeBar, makeLathe, makeRing, mergeParts } from "./geometry";
import { HUB, LATHE_SEGMENTS, REAR_STUB, RIB, SMALL_SEGMENTS, SPIDER_ANGLES } from "./layout";

type Props = ThreeElements["group"];

/**
 * The skeleton case behind the bezel: four longitudinal ribs, the rear hoop
 * they end on, the three-arm spider and its hub that hold the bearing, and
 * the rear stub that turns in the cradle's roll boss. Everything is one
 * merged geometry, one draw call. Fixed to the case.
 */
export default function Cage(props: Props) {
  const tier = useTimeline((s) => s.tier);
  const materials = useMemo(() => getInstrumentMaterials(tier), [tier]);
  const geometry = useMemo(() => build(tier), [tier]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group {...props}>
      <mesh geometry={geometry} material={materials.aluminiumLinear} />
    </group>
  );
}

function build(tier: Tier): BufferGeometry {
  const segments = LATHE_SEGMENTS[tier];
  const small = SMALL_SEGMENTS[tier];
  const parts: BufferGeometry[] = [];

  for (const deg of RIB.angles) {
    const a = MathUtils.degToRad(deg);
    const rib = makeBar(RIB.length, RIB.section, RIB.section, 0.006);
    rib.rotateZ(a);
    rib.translate(Math.cos(a) * RIB.radius, Math.sin(a) * RIB.radius, RIB.z);
    parts.push(rib);
  }

  const hoop = makeRing({ meanRadius: RIB.radius, radial: 0.06, axial: RIB.section, chamfer: 0.006 }, { segments });
  hoop.translate(0, 0, HUB.z);
  parts.push(hoop);

  for (const deg of SPIDER_ANGLES) {
    const a = MathUtils.degToRad(deg);
    const inner = HUB.radius - 0.02;
    const outer = RIB.radius - 0.02;
    const arm = makeBar(outer - inner, RIB.section, RIB.section, 0.006);
    arm.rotateY(Math.PI / 2);
    arm.rotateZ(a);
    const mid = (inner + outer) / 2;
    arm.translate(Math.cos(a) * mid, Math.sin(a) * mid, HUB.z);
    parts.push(arm);
  }

  const hub = makeLathe(cylinderProfile(HUB.radius, HUB.length, 0.008), { segments: small });
  hub.rotateX(Math.PI / 2);
  hub.translate(0, 0, HUB.z);
  parts.push(hub);

  // Rear stub: the case's axle, turned in the cradle's roll boss behind
  // the outer gimbal's bearing.
  const stub = makeLathe(cylinderProfile(REAR_STUB.radius, REAR_STUB.length, 0.008), { segments: small });
  stub.rotateX(Math.PI / 2);
  stub.translate(0, 0, REAR_STUB.z);
  parts.push(stub);

  return mergeParts(parts);
}
