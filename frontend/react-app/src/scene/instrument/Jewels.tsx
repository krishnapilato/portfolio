import { useEffect, useMemo } from "react";
import { Color, CylinderGeometry, MeshPhysicalMaterial } from "three";
import { useTimeline } from "../../lib/store";
import { makeFixtureMetal } from "../../textures/instrument";

/**
 * Jewel bearings on the roll gimbal's outer rim, one each side, where the
 * pitch gimbal's pivot pins run. A brushed setting and a small synthetic
 * ruby whose edge catches the light: the macro subject of the skills beat.
 */
export default function Jewels() {
  const tier = useTimeline((s) => s.tier);

  const built = useMemo(() => {
    const setting = makeFixtureMetal(tier, "jewels", 0.3);
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
    return { setting, ruby, settingGeometry, rubyGeometry };
  }, [tier]);

  useEffect(() => {
    return () => {
      built.setting.dispose();
      built.ruby.dispose();
      built.settingGeometry.dispose();
      built.rubyGeometry.dispose();
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
