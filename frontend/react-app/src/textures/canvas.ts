import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

export type Ctx2D = CanvasRenderingContext2D;

/** A 2D canvas of the given size with an opaque fill, ready to draw on. */
export function makeCanvas(size: number, fill = "#000"): [HTMLCanvasElement, Ctx2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, size, size);
  return [canvas, ctx];
}

type TextureOptions = {
  /** Colour maps are sRGB; data maps (roughness, normal, metalness) are not. */
  color?: boolean;
  repeat?: number;
  anisotropy?: number;
};

/** Wraps a canvas as a three.js texture with the right colour space and filtering. */
export function toTexture(canvas: HTMLCanvasElement, options: TextureOptions = {}): Texture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = options.color ? SRGBColorSpace : NoColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(options.repeat ?? 1, options.repeat ?? 1);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = options.anisotropy ?? 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Deterministic pseudo-random numbers so a texture is identical on every
 * visit and every device. Mulberry32 is small and good enough for noise.
 */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise on a lattice, tileable at `period` cells. */
export function makeValueNoise(seed: number, period = 8) {
  const random = rng(seed);
  const lattice = new Float32Array(period * period);
  for (let i = 0; i < lattice.length; i++) lattice[i] = random();
  const at = (x: number, y: number) =>
    lattice[((y % period) + period) % period * period + (((x % period) + period) % period)];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  return (u: number, v: number) => {
    const x = u * period;
    const y = v * period;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  };
}

/** Fractal sum of value noise: `octaves` layers, each finer and fainter. */
export function makeFbm(seed: number, octaves = 4, period = 4) {
  const layers = Array.from({ length: octaves }, (_, i) =>
    makeValueNoise(seed + i * 101, period << i),
  );
  let norm = 0;
  for (let i = 0; i < octaves; i++) norm += 1 / (1 << i);
  return (u: number, v: number) => {
    let sum = 0;
    for (let i = 0; i < octaves; i++) sum += layers[i](u, v) / (1 << i);
    return sum / norm;
  };
}

/**
 * Turns a greyscale height canvas into a tangent-space normal map with a
 * Sobel filter. `strength` is the height scale in texels; small values
 * (0.5–3) read as fine machining, large ones as deep engraving.
 */
export function heightToNormal(height: HTMLCanvasElement, strength = 2): HTMLCanvasElement {
  const size = height.width;
  const src = height.getContext("2d")!.getImageData(0, 0, size, size).data;
  const [canvas, ctx] = makeCanvas(size, "#8080ff");
  const out = ctx.createImageData(size, size);
  const h = (x: number, y: number) =>
    src[((((y % size) + size) % size) * size + (((x % size) + size) % size)) * 4] / 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx =
        (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1)) -
        (h(x - 1, y - 1) + 2 * h(x - 1, y) + h(x - 1, y + 1));
      const dy =
        (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1)) -
        (h(x - 1, y - 1) + 2 * h(x, y - 1) + h(x + 1, y - 1));
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * size + x) * 4;
      out.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

/** Per-pixel blend of two greyscale canvases: out = a * (1 - t) + b * t. */
export function mixCanvas(a: HTMLCanvasElement, b: HTMLCanvasElement, t: number) {
  const size = a.width;
  const [canvas, ctx] = makeCanvas(size);
  ctx.drawImage(a, 0, 0);
  ctx.globalAlpha = t;
  ctx.drawImage(b, 0, 0);
  ctx.globalAlpha = 1;
  return canvas;
}
