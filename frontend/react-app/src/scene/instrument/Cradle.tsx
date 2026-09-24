import { useEffect, useMemo, type ReactNode } from "react";
import { BoxGeometry, CylinderGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useTimeline } from "../../lib/store";
import { makeFixtureMetal } from "../../textures/instrument";

type Props = { children?: ReactNode };

/**
 * The pitching part of the fixture: two lugs on the fork's trunnion pins,
 * two arms running back, a bar, and the roll boss that houses the case's
 * rear stub. It pitches about X; the case rolls inside it about Z.
 */
export default function Cradle({ children }: Props) {
  const tier = useTimeline((s) => s.tier);

  const built = useMemo(() => {
    const metal = makeFixtureMetal(tier, "cradle", 0.35);
    const lugL = new BoxGeometry(0.1, 0.2, 0.2).translate(-1.78, 0, 0);
    const lugR = new BoxGeometry(0.1, 0.2, 0.2).translate(1.78, 0, 0);
    const armL = new BoxGeometry(0.1, 0.1, 1.55).translate(-1.72, 0, -0.775);
    const armR = new BoxGeometry(0.1, 0.1, 1.55).translate(1.72, 0, -0.775);
    const bar = new BoxGeometry(3.54, 0.12, 0.12).translate(0, 0, -1.55);
    const boss = new CylinderGeometry(0.16, 0.16, 0.3, 32).rotateX(Math.PI / 2).translate(0, 0, -1.55);
    // Trunnion pins: the cradle's bearings in the fork arms.
    const pinL = new CylinderGeometry(0.06, 0.06, 0.24, 24).rotateZ(Math.PI / 2).translate(-1.85, 0, 0);
    const pinR = new CylinderGeometry(0.06, 0.06, 0.24, 24).rotateZ(Math.PI / 2).translate(1.85, 0, 0);
    const body = mergeGeometries([lugL, lugR, armL, armR, bar, boss, pinL, pinR], false);
    return { metal, body };
  }, [tier]);

  useEffect(() => {
    return () => {
      built.body.dispose();
      built.metal.dispose();
    };
  }, [built]);

  return (
    <group name="cradle">
      <mesh geometry={built.body} material={built.metal} castShadow receiveShadow />
      {children}
    </group>
  );
}
