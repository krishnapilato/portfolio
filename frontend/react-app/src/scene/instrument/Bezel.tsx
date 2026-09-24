import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CylinderGeometry, MathUtils, SphereGeometry } from "three";
import { useTimeline } from "../../lib/store";
import type { Tier } from "../../lib/store";
import { getInstrumentMaterials, makeBezelFace, makeGlass } from "../../textures/instrument";
import { cylinderProfile, makeBar, makeLathe, makeRing, makeRingFace, mergeParts } from "./geometry";
import { BEZEL, BEZEL_Z, GLASS, LATHE_SEGMENTS, POST_LIGHT, SMALL_SEGMENTS, SYMBOL } from "./layout";

type Props = ThreeElements["group"] & {
  /** Post-light brightness 0..1 (0 = unlit, as before the epilogue). */
  glow?: number;
};

/**
 * Front of the case: the bezel ring with the engraved, paint-filled bank
 * scale on its face, the two post lights, the cover glass and the orange
 * miniature aircraft on its struts. Five draw calls. Fixed to the case, so
 * the parent rotates it with the ribs.
 */
export default function Bezel({ glow = 0, ...group }: Props) {
  const tier = useTimeline((s) => s.tier);
  const quality = useTimeline((s) => s.quality);
  const materials = useMemo(() => getInstrumentMaterials(tier), [tier]);
  const face = useMemo(() => makeBezelFace(tier), [tier]);
  // Refracting glass only at the high level: it is an extra scene pass.
  const glass = useMemo(() => makeGlass(tier, quality === "high"), [tier, quality]);
  const g = useMemo(() => build(tier), [tier]);
  useEffect(() => () => face.dispose(), [face]);
  useEffect(() => () => glass.dispose(), [glass]);
  useEffect(
    () => () => {
      for (const geo of Object.values(g)) geo.dispose();
    },
    [g],
  );

  return (
    <group {...group}>
      <group position={[0, 0, BEZEL_Z]}>
        <mesh geometry={g.body} material={materials.aluminiumRadial} />
        <mesh geometry={g.face} material={face} />
        <mesh geometry={g.lamps}>
          <meshStandardMaterial
            color="#5a3d22"
            emissive={POST_LIGHT.color}
            emissiveIntensity={glow * POST_LIGHT.emissiveScale}
            roughness={0.45}
            metalness={0.2}
          />
        </mesh>
        <mesh geometry={g.glass} material={glass} />
        <mesh geometry={g.symbol}>
          <meshStandardMaterial
            color={SYMBOL.color}
            emissive={SYMBOL.color}
            emissiveIntensity={SYMBOL.emissiveIntensity}
            roughness={0.5}
            metalness={0}
          />
        </mesh>
      </group>
    </group>
  );
}

function build(tier: Tier) {
  const segments = LATHE_SEGMENTS[tier];
  const small = SMALL_SEGMENTS[tier];
  const front = BEZEL.axial / 2;

  const body = makeRing(BEZEL, { segments, openFront: true });
  const face = makeRingFace(BEZEL, segments);

  const lamps = mergeParts(
    [POST_LIGHT.angle, -POST_LIGHT.angle].map((deg) => {
      const lamp = makeLathe(cylinderProfile(POST_LIGHT.radius, POST_LIGHT.length, 0.004), { segments: small });
      lamp.rotateX(Math.PI / 2);
      const a = MathUtils.degToRad(deg);
      lamp.translate(Math.sin(a) * BEZEL.meanRadius, Math.cos(a) * BEZEL.meanRadius, front + POST_LIGHT.length / 2 - 0.01);
      return lamp;
    }),
  );

  const glass = new CylinderGeometry(GLASS.radius, GLASS.radius, GLASS.thickness, segments, 1, false);
  glass.rotateX(Math.PI / 2);
  glass.translate(0, 0, GLASS.z - BEZEL_Z);

  const z = SYMBOL.z - BEZEL_Z;
  const [barLength, barHeight, barDepth] = SYMBOL.bar;
  const barCentre = SYMBOL.gap / 2 + barLength / 2;
  const barEnd = SYMBOL.gap / 2 + barLength;
  const strutEnd = BEZEL.meanRadius - BEZEL.radial / 2 + 0.02;
  const strutLength = strutEnd - barEnd;
  const parts = [];
  for (const side of [-1, 1]) {
    const bar = makeBar(barLength, barDepth, barHeight, 0.003);
    bar.rotateY(Math.PI / 2);
    bar.translate(side * barCentre, 0, z);
    const strut = makeBar(strutLength, SYMBOL.strut, SYMBOL.strut * 1.6, 0.001);
    strut.rotateY(Math.PI / 2);
    strut.translate(side * (barEnd + strutLength / 2), 0, z);
    parts.push(bar, strut);
  }
  const dot = new SphereGeometry(SYMBOL.dot, 24, 16);
  dot.translate(0, 0, z);
  parts.push(dot);
  const symbol = mergeParts(parts);

  return { body, face, lamps, glass, symbol };
}
