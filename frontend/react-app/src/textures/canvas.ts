/**
 * Drawing surfaces and the per-pixel toolkit behind every generated map.
 * Nothing here touches three.js or the DOM beyond a canvas, so the same
 * code builds the maps inside a Web Worker (OffscreenCanvas) or, where a
 * worker cannot draw, on the main thread.
 */

/** An HTML canvas on the main thread, an OffscreenCanvas in a worker. */
export type Surface = HTMLCanvasElement | OffscreenCanvas;
export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** A 2D surface of the given size with an opaque fill, ready to draw on. */
export function makeSurface(width: number, height = width, fill = "#000"): [Surface, Ctx2D] {
  let canvas: Surface;
  let ctx: Ctx2D | null;
  if (typeof document === "undefined") {
    const c = new OffscreenCanvas(width, height);
    canvas = c;
    ctx = c.getContext("2d", { willReadFrequently: true });
  } else {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    canvas = c;
    ctx = c.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);
  return [canvas, ctx];
}

/** A square surface. */
export const makeCanvas = (size: number, fill = "#000"): [Surface, Ctx2D] => makeSurface(size, size, fill);

/** The 2D context of an existing surface. */
export function ctxOf(surface: Surface): Ctx2D {
  // Both kinds of surface answer to getContext("2d"); the cast only unifies the two signatures.
  const ctx = (surface as HTMLCanvasElement).getContext("2d") as Ctx2D | null;
  if (!ctx) throw new Error("2D canvas unavailable");
  return ctx;
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

/** Smooth value noise on a lattice, tileable at `period` cells (a power of two). */
export function makeValueNoise(seed: number, period = 8) {
  const random = rng(seed);
  const mask = period - 1;
  if ((period & mask) !== 0) throw new Error("noise period must be a power of two");
  const lattice = new Float32Array(period * period);
  for (let i = 0; i < lattice.length; i++) lattice[i] = random();
  return (u: number, v: number) => {
    const x = u * period;
    const y = v * period;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = x - x0;
    const ty = y - y0;
    const fx = tx * tx * tx * (tx * (tx * 6 - 15) + 10);
    const fy = ty * ty * ty * (ty * (ty * 6 - 15) + 10);
    const xa = x0 & mask;
    const xb = (x0 + 1) & mask;
    const ya = (y0 & mask) * period;
    const yb = ((y0 + 1) & mask) * period;
    const a = lattice[ya + xa];
    const b = lattice[ya + xb];
    const c = lattice[yb + xa];
    const d = lattice[yb + xb];
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
 * Turns a greyscale height surface into a tangent-space normal map with a
 * Sobel filter, wrapping at the edges so the map tiles. `strength` is the
 * height scale in texels; small values (0.5–3) read as fine machining,
 * large ones as deep engraving.
 */
export function heightToNormal(height: Surface, strength = 2): Surface {
  const size = height.width;
  const src = ctxOf(height).getImageData(0, 0, size, size).data;
  const [canvas, ctx] = makeCanvas(size, "#8080ff");
  const out = ctx.createImageData(size, size);
  const data = out.data;
  const k = strength / 255;
  for (let y = 0; y < size; y++) {
    const rowM = (y === 0 ? size - 1 : y - 1) * size;
    const row = y * size;
    const rowP = (y === size - 1 ? 0 : y + 1) * size;
    for (let x = 0; x < size; x++) {
      const xm = x === 0 ? size - 1 : x - 1;
      const xp = x === size - 1 ? 0 : x + 1;
      const tl = src[(rowM + xm) << 2];
      const tc = src[(rowM + x) << 2];
      const tr = src[(rowM + xp) << 2];
      const ml = src[(row + xm) << 2];
      const mr = src[(row + xp) << 2];
      const bl = src[(rowP + xm) << 2];
      const bc = src[(rowP + x) << 2];
      const br = src[(rowP + xp) << 2];
      // Tangent space: +u is right, +v is UP the image (row 0 is v = 1 once
      // uploaded), so the v slope is top minus bottom, and the normal leans
      // against both slopes.
      const nx = -(tr + 2 * mr + br - (tl + 2 * ml + bl)) * k;
      const ny = (bl + 2 * bc + br - (tl + 2 * tc + tr)) * k;
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      const i = (row + x) << 2;
      data[i] = (nx * inv * 0.5 + 0.5) * 255;
      data[i + 1] = (ny * inv * 0.5 + 0.5) * 255;
      data[i + 2] = (inv * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

/** Per-pixel blend of two greyscale surfaces: out = a * (1 - t) + b * t. */
export function mixCanvas(a: Surface, b: Surface, t: number): Surface {
  const size = a.width;
  const [canvas, ctx] = makeCanvas(size);
  ctx.drawImage(a, 0, 0);
  ctx.globalAlpha = t;
  ctx.drawImage(b, 0, 0);
  ctx.globalAlpha = 1;
  return canvas;
}

/** A copy of the surface flipped vertically (for bitmaps that upload without flipY). */
export function flipVertical(surface: Surface): Surface {
  const [canvas, ctx] = makeSurface(surface.width, surface.height);
  ctx.translate(0, surface.height);
  ctx.scale(1, -1);
  ctx.drawImage(surface, 0, 0);
  return canvas;
}
