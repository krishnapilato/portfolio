import { heightToNormal, makeCanvas, makeFbm, rng, type Surface } from "./canvas";

export type BrushedSet = {
  /** sRGB albedo. */
  albedo: Surface;
  /** Greyscale roughness. */
  rough: Surface;
  /** Greyscale height the normal map was derived from. */
  height: Surface;
  /** Tangent-space normal map. */
  normal: Surface;
};

export type BrushedOptions = {
  size: number;
  /** "linear" for milled flats, "radial" for lathe-turned faces and rims. */
  direction?: "linear" | "radial";
  /** Base tint of the alloy in sRGB. */
  tint?: string;
  /** How dark the streaks get: 0 = mirror polish, 1 = coarse grind. */
  grain?: number;
  /** Base roughness of the surface between streaks (0..1). */
  roughness?: number;
  /** Density of sparse handling scratches across the grain: 0 = none, 1 = well used. */
  scratches?: number;
  seed?: number;
};

/**
 * Brushed metal in three maps. The streaks are drawn as thousands of thin
 * lines of random length and alpha, in the brushing direction, then a
 * low-frequency fbm modulates the whole plate so it never looks stamped.
 * The roughness map follows the streaks (grooves scatter light) and the
 * normal map comes from the same height data, so all three maps agree.
 */
export function makeBrushed(options: BrushedOptions): BrushedSet {
  const {
    size,
    direction = "linear",
    tint = "#b9bcc2",
    grain = 0.55,
    roughness = 0.38,
    scratches = 0.25,
    seed = 7,
  } = options;
  const random = rng(seed);
  const fbm = makeFbm(seed + 3, 3, 2);

  // Height: streaks as bright/dark hairlines on mid grey.
  const [height, hctx] = makeCanvas(size, "#808080");
  hctx.lineCap = "butt";
  const count = Math.round(size * size * 0.0085);
  for (let i = 0; i < count; i++) {
    const v = random();
    const light = random() > 0.5;
    const alpha = (0.08 + random() * 0.32) * grain;
    hctx.strokeStyle = light
      ? `rgba(255,255,255,${alpha})`
      : `rgba(0,0,0,${alpha})`;
    hctx.lineWidth = 0.6 + random() * 1.2;
    hctx.beginPath();
    if (direction === "linear") {
      const y = v * size;
      const x = random() * size;
      const len = size * (0.05 + random() * 0.45);
      hctx.moveTo(x - len, y);
      hctx.lineTo(x + len, y);
    } else {
      const r = 8 + v * (size * 0.5 - 8);
      const start = random() * Math.PI * 2;
      const sweep = 0.15 + random() * 1.4;
      hctx.arc(size / 2, size / 2, r, start, start + sweep);
    }
    hctx.stroke();
  }
  // Sparse scratches that cross the grain: a handful of long, faint,
  // slightly curved hairlines, the way a part looks after real handling.
  const scratchCount = Math.round(scratches * size * 0.06);
  for (let i = 0; i < scratchCount; i++) {
    const x = random() * size;
    const y = random() * size;
    const angle = random() * Math.PI;
    const len = size * (0.04 + random() * 0.3);
    const bend = (random() - 0.5) * len * 0.35;
    hctx.strokeStyle = `rgba(255,255,255,${0.18 + random() * 0.35})`;
    hctx.lineWidth = 0.5 + random() * 0.9;
    hctx.beginPath();
    hctx.moveTo(x, y);
    hctx.quadraticCurveTo(
      x + Math.cos(angle + 1.57) * bend + (Math.cos(angle) * len) / 2,
      y + Math.sin(angle + 1.57) * bend + (Math.sin(angle) * len) / 2,
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len,
    );
    hctx.stroke();
  }
  // Low-frequency waviness of the plate, so highlights swim instead of banding.
  const img = hctx.getImageData(0, 0, size, size);
  const data = img.data;
  const inv = 1 / size;
  for (let y = 0; y < size; y++) {
    const v = y * inv;
    for (let x = 0; x < size; x++) {
      const n = (fbm(x * inv, v) - 0.5) * 22;
      const i = (y * size + x) << 2;
      const value = Math.min(255, Math.max(0, data[i] + n));
      data[i] = data[i + 1] = data[i + 2] = value;
    }
  }
  hctx.putImageData(img, 0, 0);

  // Albedo: tint modulated by the streaks, kept close to neutral so the
  // environment map, not the texture, gives the metal its colour.
  const [albedo, actx] = makeCanvas(size, tint);
  actx.globalCompositeOperation = "overlay";
  actx.globalAlpha = 0.55;
  actx.drawImage(height, 0, 0);
  actx.globalCompositeOperation = "source-over";
  actx.globalAlpha = 1;

  // Roughness: streak contrast raises roughness locally.
  const [rough, rctx] = makeCanvas(size);
  const base = Math.round(roughness * 255);
  rctx.fillStyle = `rgb(${base},${base},${base})`;
  rctx.fillRect(0, 0, size, size);
  rctx.globalCompositeOperation = "lighter";
  rctx.globalAlpha = 0.35 * grain;
  rctx.drawImage(height, 0, 0);
  rctx.globalCompositeOperation = "source-over";
  rctx.globalAlpha = 1;

  const normal = heightToNormal(height, 1.4);

  return { albedo, rough, height, normal };
}
