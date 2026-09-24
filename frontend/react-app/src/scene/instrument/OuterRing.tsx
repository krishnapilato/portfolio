import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { useTimeline } from "../../lib/store";
import type { Tier } from "../../lib/store";
import { getInstrumentMaterials } from "../../textures/instrument";
import { cylinderProfile, makeBar, makeLathe, makeRing, makeTriangle, mergeParts, pinProfile } from "./geometry";
import { BANK_POINTER, BEARING, LATHE_SEGMENTS, OUTER_RING, PIVOT_PIN, SMALL_SEGMENTS } from "./layout";

type Props = ThreeElements["group"];

/**
 * Roll gimbal: the ring that carries the pitch gimbal on two steel pivot
 * pins, with the bank pointer on its front face and, behind it, the L
 * bracket down to the rear bearing boss and journal. One aluminium draw
 * call plus one for the pins. The parent rotates the group about Z (roll)
 * and adds the case pitch and yaw.
 */
export default function OuterRing(props: Props) {
  const tier = useTimeline((s) => s.tier);
  const materials = useMemo(() => getInstrumentMaterials(tier), [tier]);
  const { body, pins } = useMemo(() => build(tier), [tier]);
  useEffect(
    () => () => {
      body.dispose();
      pins.dispose();
    },
    [body, pins],
  );

  return (
    <group {...props}>
      <mesh geometry={body} material={materials.aluminiumRadial} />
      <mesh geometry={pins} material={materials.steel} />
    </group>
  );
}

function build(tier: Tier) {
  const segments = LATHE_SEGMENTS[tier];
  const small = SMALL_SEGMENTS[tier];

  const ring = makeRing(OUTER_RING, { segments });

  const pointer = makeTriangle(BANK_POINTER.base, BANK_POINTER.tip, BANK_POINTER.halfWidth, BANK_POINTER.depth);
  pointer.translate(0, 0, OUTER_RING.axial / 2);

  const { boss, shaft, bracket } = BEARING;
  const bossGeo = makeLathe(cylinderProfile(boss.radius, boss.length, 0.01), { segments: small });
  bossGeo.rotateX(Math.PI / 2);
  bossGeo.translate(0, 0, boss.z);
  const shaftGeo = makeLathe(cylinderProfile(shaft.radius, shaft.length, 0.006), { segments: small });
  shaftGeo.rotateX(Math.PI / 2);
  shaftGeo.translate(0, 0, shaft.z);

  // L bracket: back from the ring's 6 o'clock, then up the -Z axis into the boss.
  const back = -OUTER_RING.axial / 2;
  const alongZ = makeBar(boss.z - back + 0.04 + bracket.section / 2, bracket.section, bracket.section, 0.008);
  alongZ.translate(0, -OUTER_RING.meanRadius, (boss.z + back) / 2 - 0.02 + bracket.section / 4);
  const yBottom = -OUTER_RING.meanRadius - bracket.section / 2;
  const yTop = -boss.radius + 0.04;
  const up = makeBar(yTop - yBottom, bracket.section, bracket.section, 0.008);
  up.rotateX(Math.PI / 2);
  up.translate(0, (yTop + yBottom) / 2, boss.z);

  const body = mergeParts([ring, pointer, bossGeo, shaftGeo, alongZ, up]);

  const pinRight = makeLathe(pinProfile(PIVOT_PIN), { segments: small });
  pinRight.rotateZ(-Math.PI / 2);
  pinRight.translate(PIVOT_PIN.x, 0, 0);
  const pinLeft = makeLathe(pinProfile(PIVOT_PIN), { segments: small });
  pinLeft.rotateZ(Math.PI / 2);
  pinLeft.translate(-PIVOT_PIN.x, 0, 0);
  const pins = mergeParts([pinRight, pinLeft]);

  return { body, pins };
}
