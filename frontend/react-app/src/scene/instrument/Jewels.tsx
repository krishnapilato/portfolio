import { useEffect, useMemo } from "react";
import { Color, CylinderGeometry, MeshPhysicalMaterial, Vector2 } from "three";
import { useTimeline } from "../../lib/store";
import { makeBrushed } from "../../textures/brushed";

/**
 * Jewel bearings on the roll gimbal's outer rim, one each side, where the
 * pitch gimbal's pivot pins run. A brushed setting and a small synthetic
 * ruby whose edge catches the light: the macro subject of the skills beat.
 */
export default function Jewels() {
  const tier = useTimeline((s) => s.tier);

  const built = useMemo(() => {
    const size = tier === "low" ? 256 : 512;
    const brushed = makeBrushed({ size, direction: "radial", tint: "#b9bec4", grain: 0.5, roughness: 0.3, scratches: 0.2, seed: 91, anisotropy: tier === "high" ? 8 : 4 });
    const setting = new MeshPhysicalMaterial({
      color: "#b9bec4",
      metalness: 1,
      roughness: 1,
      roughnessMap: brushed.roughnessMap,
      normalMap: brushed.normalMap,
      normalScale: new Vector2(0.3, 0.3),
      anisotropy: tier === "low" ? 0 : 0.8,
    });
    const ruby = new MeshPhysicalMaterial({
      color: "#5a0e1c",
      roughness: 0.15,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    // A fresnel glint: the gem's edge warms up where the view grazes it.
    ruby.onBeforeCompile = (shader) => {
      shader.uniforms.uGlint = { value: new Color("#c8243c") };
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform vec3 uGlint;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\n  totalEmissiveRadiance += uGlint * 0.25 * pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);",
        );
    };
    ruby.customProgramCacheKey = () => "ruby-glint-v1";
    const settingGeometry = new CylinderGeometry(0.08, 0.08, 0.05, 32).rotateZ(Math.PI / 2);
    const rubyGeometry = new CylinderGeometry(0.035, 0.035, 0.012, 24).rotateZ(Math.PI / 2);
    return { setting, ruby, settingGeometry, rubyGeometry, maps: [brushed.map, brushed.roughnessMap, brushed.normalMap] };
  }, [tier]);

  useEffect(() => {
    return () => {
      built.setting.dispose();
      built.ruby.dispose();
      built.settingGeometry.dispose();
      built.rubyGeometry.dispose();
      for (const map of built.maps) map.dispose();
    };
  }, [built]);

  return (
    <group name="jewels">
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh geometry={built.settingGeometry} material={built.setting} position={[side * 1.425, 0, 0]} castShadow />
          <mesh geometry={built.rubyGeometry} material={built.ruby} position={[side * 1.452, 0, 0]} />
        </group>
      ))}
    </group>
  );
}
