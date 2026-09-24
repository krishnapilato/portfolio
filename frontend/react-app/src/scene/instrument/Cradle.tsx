import { useEffect, useMemo, type ReactNode } from "react";
import { BoxGeometry, CylinderGeometry, MeshPhysicalMaterial, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useTimeline } from "../../lib/store";
import { makeBrushed } from "../../textures/brushed";

type Props = { children?: ReactNode };

/**
 * The pitching part of the fixture: two lugs on the fork's trunnion pins,
 * two arms running back, a bar, and the roll boss that houses the case's
 * rear stub. It pitches about X; the case rolls inside it about Z.
 */
export default function Cradle({ children }: Props) {
  const tier = useTimeline((s) => s.tier);

  const built = useMemo(() => {
    const size = tier === "low" ? 512 : 1024;
    const brushed = makeBrushed({ size, direction: "linear", tint: "#b9bec4", grain: 0.5, roughness: 0.3, scratches: 0.3, seed: 57, anisotropy: tier === "high" ? 8 : 4 });
    const metal = new MeshPhysicalMaterial({
      color: "#b9bec4",
      metalness: 1,
      roughness: 1,
      roughnessMap: brushed.roughnessMap,
      normalMap: brushed.normalMap,
      normalScale: new Vector2(0.35, 0.35),
      anisotropy: tier === "low" ? 0 : 0.8,
    });
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
    return { metal, body, maps: [brushed.map, brushed.roughnessMap, brushed.normalMap] };
  }, [tier]);

  useEffect(() => {
    return () => {
      built.body.dispose();
      built.metal.dispose();
      for (const map of built.maps) map.dispose();
    };
  }, [built]);

  return (
    <group name="cradle">
      <mesh geometry={built.body} material={built.metal} castShadow receiveShadow />
      {children}
    </group>
  );
}
