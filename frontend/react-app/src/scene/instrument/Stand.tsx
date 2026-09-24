import { useEffect, useMemo } from "react";
import { BoxGeometry, CylinderGeometry, InstancedMesh, Matrix4, MeshPhysicalMaterial, MeshStandardMaterial, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useTimeline } from "../../lib/store";
import { makeBrushed } from "../../textures/brushed";
import { heightToNormal, makeCanvas, makeValueNoise, rng, toTexture } from "../../textures/canvas";
import { PALETTE } from "../palette";

/** Crackle paint: Worley cells with a darkened bevel at every edge. */
function makeCrackle(size: number) {
  const random = rng(172);
  const cells = 48;
  const seeds: [number, number][] = [];
  for (let i = 0; i < cells; i++) seeds.push([random() * size, random() * size]);
  const [height, hctx] = makeCanvas(size, "#808080");
  const img = hctx.createImageData(size, size);
  const noise = makeValueNoise(9, 6);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f1 = Infinity;
      let f2 = Infinity;
      for (const [sx, sy] of seeds) {
        let dx = Math.abs(x - sx);
        let dy = Math.abs(y - sy);
        if (dx > size / 2) dx = size - dx;
        if (dy > size / 2) dy = size - dy;
        const d = dx * dx + dy * dy;
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
      }
      const edge = Math.sqrt(f2) - Math.sqrt(f1);
      const bevel = Math.min(1, Math.max(0, (edge - 1.5) / 6));
      const v = Math.round((0.35 + 0.55 * bevel + (noise(x / size, y / size) - 0.5) * 0.08) * 255);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  hctx.putImageData(img, 0, 0);
  return heightToNormal(height, 0.5);
}

/**
 * The fixed part of the bench fixture: a painted pedestal on the floor, a
 * post, and a fork whose two arms carry the cradle on trunnion pins. It
 * stands behind the instrument and cantilevers it forward, so the front
 * and the floor under the object stay clean for the low product shot.
 */
export default function Stand() {
  const tier = useTimeline((s) => s.tier);

  const built = useMemo(() => {
    const size = tier === "low" ? 512 : 1024;
    const brushed = makeBrushed({ size, direction: "linear", tint: "#b9bec4", grain: 0.55, roughness: 0.3, scratches: 0.35, seed: 31, anisotropy: tier === "high" ? 8 : 4 });
    const metal = new MeshPhysicalMaterial({
      color: "#b9bec4",
      metalness: 1,
      roughness: 1,
      roughnessMap: brushed.roughnessMap,
      normalMap: brushed.normalMap,
      normalScale: new Vector2(0.35, 0.35),
      anisotropy: tier === "low" ? 0 : 0.8,
      envMapIntensity: 1,
    });
    const crackleNormal = toTexture(makeCrackle(tier === "low" ? 256 : 512), { repeat: 2 });
    const paint = new MeshStandardMaterial({
      color: PALETTE.surface,
      roughness: 0.75,
      metalness: 0,
      normalMap: crackleNormal,
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
    return { metal, paint, body, pedestal, bolts, maps: [brushed.map, brushed.roughnessMap, brushed.normalMap, crackleNormal] };
  }, [tier]);

  useEffect(() => {
    return () => {
      built.body.dispose();
      built.pedestal.dispose();
      built.bolts.geometry.dispose();
      built.metal.dispose();
      built.paint.dispose();
      for (const map of built.maps) map.dispose();
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
