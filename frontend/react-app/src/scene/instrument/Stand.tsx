import { useEffect, useMemo } from "react";
import { BoxGeometry, CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useTimeline } from "../../lib/store";
import { makeFixtureMetal } from "../../textures/instrument";
import { getMaps } from "../../textures/library";
import { PALETTE } from "../palette";

/**
 * The fixed part of the bench fixture: a painted pedestal on the floor, a
 * post, and a fork whose two arms carry the cradle on trunnion pins. It
 * stands behind the instrument and cantilevers it forward, so the front
 * and the floor under the object stay clean for the low product shot.
 */
export default function Stand() {
  const tier = useTimeline((s) => s.tier);

  const built = useMemo(() => {
    const metal = makeFixtureMetal(tier, "stand", 0.35);
    const paint = new MeshStandardMaterial({
      color: PALETTE.surface,
      roughness: 0.75,
      metalness: 0,
      normalMap: getMaps(tier)["stand.crackleNormal"],
      normalScale: new Vector2(0.5, 0.5),
    });

    // Post, fork bar and fork arms share one draw call.
    const post = new BoxGeometry(0.14, 2.0, 0.14).translate(0, -1.06, -1.9);
    const bar = new BoxGeometry(3.9, 0.12, 0.12).translate(0, 0, -1.9);
    const armL = new BoxGeometry(0.12, 0.12, 1.95).translate(-1.95, 0, -0.925);
    const armR = new BoxGeometry(0.12, 0.12, 1.95).translate(1.95, 0, -0.925);
    const body = mergeGeometries([post, bar, armL, armR], false);
    const pedestal = new CylinderGeometry(0.42, 0.42, 0.24, 48).translate(0, -2.18, -1.9);

    // Eight hex bolt heads around the pedestal top.
    const bolt = new CylinderGeometry(0.035, 0.035, 0.02, 6);
    const bolts = new InstancedMesh(bolt, metal, 8);
    const m = new Matrix4();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      m.makeTranslation(Math.cos(a) * 0.34, -2.05, -1.9 + Math.sin(a) * 0.34);
      bolts.setMatrixAt(i, m);
    }
    bolts.instanceMatrix.needsUpdate = true;
    return { metal, paint, body, pedestal, bolts };
  }, [tier]);

  useEffect(() => {
    return () => {
      built.body.dispose();
      built.pedestal.dispose();
      built.bolts.geometry.dispose();
      built.metal.dispose();
      built.paint.dispose();
    };
  }, [built]);

  return (
    <group name="stand">
      <mesh geometry={built.body} material={built.metal} castShadow receiveShadow />
      <mesh geometry={built.pedestal} material={built.paint} castShadow receiveShadow />
      <primitive object={built.bolts} />
    </group>
  );
}
