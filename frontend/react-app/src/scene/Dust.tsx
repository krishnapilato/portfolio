import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, ShaderMaterial } from "three";
import { rng } from "../textures/canvas";

type Props = {
  count?: number;
  /** Half-extents of the box the motes live in. */
  extent?: [number, number, number];
  center?: [number, number, number];
  color?: string;
  size?: number;
  opacity?: number;
  seed?: number;
};

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute vec3 aSeed;
  varying float vFade;
  void main() {
    // Each mote drifts on its own slow Lissajous path; no two ever align.
    vec3 p = position;
    p.x += sin(uTime * aSeed.x + aSeed.z * 6.2831) * 0.18;
    p.y += sin(uTime * aSeed.y * 0.7 + aSeed.x * 6.2831) * 0.12 + uTime * 0.008 * aSeed.y;
    p.z += cos(uTime * aSeed.z * 0.5 + aSeed.y * 6.2831) * 0.18;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = uSize * (2.0 + aSeed.z) / max(dist, 0.5);
    // Motes fade with distance and twinkle very slowly.
    vFade = smoothstep(14.0, 2.0, dist) * (0.55 + 0.45 * sin(uTime * (0.4 + aSeed.x) + aSeed.y * 9.0));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    float a = exp(-d * 3.2) * (1.0 - d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a * uOpacity * vFade);
  }
`;

/**
 * Suspended dust: the cheapest way to make a dark volume feel like air
 * with a key light in it. One draw call, positions animated on the GPU.
 */
export default function Dust({
  count = 500,
  extent = [4, 2.5, 4],
  center = [0, 0.8, 0],
  color = "#ffd9a8",
  size = 3.2,
  opacity = 0.35,
  seed = 3,
}: Props) {
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const random = rng(seed);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = center[0] + (random() * 2 - 1) * extent[0];
      positions[i * 3 + 1] = center[1] + (random() * 2 - 1) * extent[1];
      positions[i * 3 + 2] = center[2] + (random() * 2 - 1) * extent[2];
      seeds[i * 3] = 0.2 + random() * 0.6;
      seeds[i * 3 + 1] = 0.2 + random() * 0.6;
      seeds[i * 3 + 2] = random();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new Float32BufferAttribute(seeds, 3));
    return g;
  }, [count, extent, center, seed]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uColor: { value: new Color(color) },
      uOpacity: { value: opacity },
    }),
    [size, color, opacity],
  );

  useFrame((_, delta) => {
    if (material.current) material.current.uniforms.uTime.value += Math.min(delta, 0.05);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
