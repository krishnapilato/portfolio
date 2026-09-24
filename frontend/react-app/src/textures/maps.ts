import type { Tier } from "../lib/store";
import { drawBankScale } from "../scene/instrument/bankScale";
import { BEZEL } from "../scene/instrument/layout";
import { makeBrushed, type BrushedSet } from "./brushed";
import { ctxOf, heightToNormal, makeCanvas, makeFbm, makeValueNoise, rng, type Surface } from "./canvas";
import { makeDigitField } from "./digits";
import { makeEngraving, stampInk } from "./engrave";

/**
 * Every generated map of the film, built in one pass from a tier. This
 * module is pure canvas work with no three.js and no DOM, so it runs in a
 * Web Worker (see maps.worker.ts) and the main thread never freezes while
 * the metal is brushed; where a worker cannot draw, the same function runs
 * on the main thread. The result is a bundle of surfaces plus the upload
 * options each map needs (colour space, repeat, filtering).
 */

/** Brushed-metal map size per tier (the maps the macro beats magnify). */
export const MAP_SIZE: Record<Tier, number> = { high: 1024, mid: 1024, low: 512 };
/** Size of the secondary maps (crackle paint, glass smudges). */
export const DETAIL_SIZE: Record<Tier, number> = { high: 1024, mid: 512, low: 256 };
/** Texture anisotropic filtering per tier so grazing macro angles stay clean. */
export const TEXTURE_ANISOTROPY: Record<Tier, number> = { high: 8, mid: 4, low: 2 };

export const PAINT_COLOR = "#EEF1F4";
const CRACKLE_COLOR = "#151A20";
const TURNED = { tint: "#b9bcc2", grain: 0.55, roughness: 0.3, scratches: 0.3 };
const MILLED = { tint: "#b9bcc2", grain: 0.62, roughness: 0.32, scratches: 0.35 };
const FIXTURE = { tint: "#b9bec4", grain: 0.5, roughness: 0.3, scratches: 0.3 };

export type MapSpec = {
  image: Surface;
  /** Colour maps are sRGB; data maps (roughness, normal, metalness) are not. */
  color?: boolean;
  repeat?: number;
  anisotropy?: number;
  /** Clamp instead of repeat (the digit atlas). */
  clamp?: boolean;
};

export type MapName =
  | "turned.map" | "turned.rough" | "turned.normal"
  | "milled.map" | "milled.rough" | "milled.normal"
  | "crackle.map" | "crackle.rough" | "crackle.normal"
  | "bezel.map" | "bezel.rough" | "bezel.normal" | "bezel.metal" | "bezel.aniso"
  | "glass.rough"
  | "stand.rough" | "stand.normal" | "stand.crackleNormal"
  | "cradle.rough" | "cradle.normal"
  | "jewels.rough" | "jewels.normal"
  | "bench.rough" | "bench.alpha"
  | "digits.field";

export type MapBundle = Record<MapName, MapSpec>;

export function buildMaps(tier: Tier): MapBundle {
  const size = MAP_SIZE[tier];
  const anisotropy = TEXTURE_ANISOTROPY[tier];
  const fixtureAnisotropy = tier === "high" ? 8 : 4;

  // The instrument's own metals. Lathe and bar UVs wrap in u; the streak
  // canvases do not, so the wrap seam is cross-faded into the plate's own
  // middle (see blendSeam).
  const turned = makeBrushed({ size, direction: "linear", ...TURNED, seed: 172 });
  const milled = makeBrushed({ size, direction: "linear", ...MILLED, seed: 173 });
  for (const set of [turned, milled]) blendSeam(set, Math.round(size / 24));
  const crackle = makeCrackle(DETAIL_SIZE[tier], 174);
  const bezel = makeBezelFace(size);
  const glassRough = makeGlassRoughness(DETAIL_SIZE[tier], 176);

  // The bench fixture: coarser plates, no albedo needed (the materials tint).
  const fixtureSize = tier === "low" ? 512 : 1024;
  const stand = makeBrushed({ size: fixtureSize, direction: "linear", ...FIXTURE, grain: 0.55, scratches: 0.35, seed: 31 });
  const standCrackle = makeStandCrackle(tier === "low" ? 256 : 512);
  const cradle = makeBrushed({ size: fixtureSize, direction: "linear", ...FIXTURE, seed: 57 });
  const jewels = makeBrushed({ size: tier === "low" ? 256 : 512, direction: "radial", ...FIXTURE, scratches: 0.2, seed: 91 });
  const bench = makeBench(tier === "low" ? 512 : 1024);

  return {
    "turned.map": { image: turned.albedo, color: true, anisotropy },
    "turned.rough": { image: turned.rough, anisotropy },
    "turned.normal": { image: turned.normal, anisotropy },
    "milled.map": { image: milled.albedo, color: true, anisotropy },
    "milled.rough": { image: milled.rough, anisotropy },
    "milled.normal": { image: milled.normal, anisotropy },
    "crackle.map": { image: crackle.albedo, color: true, anisotropy },
    "crackle.rough": { image: crackle.rough, anisotropy },
    "crackle.normal": { image: crackle.normal, anisotropy },
    "bezel.map": { image: bezel.albedo, color: true, anisotropy },
    "bezel.rough": { image: bezel.rough, anisotropy },
    "bezel.normal": { image: bezel.normal, anisotropy },
    "bezel.metal": { image: bezel.metal, anisotropy },
    "bezel.aniso": { image: bezel.aniso, anisotropy: 2 },
    "glass.rough": { image: glassRough, anisotropy },
    "stand.rough": { image: stand.rough, anisotropy: fixtureAnisotropy },
    "stand.normal": { image: stand.normal, anisotropy: fixtureAnisotropy },
    "stand.crackleNormal": { image: standCrackle, repeat: 2 },
    "cradle.rough": { image: cradle.rough, anisotropy: fixtureAnisotropy },
    "cradle.normal": { image: cradle.normal, anisotropy: fixtureAnisotropy },
    "jewels.rough": { image: jewels.rough, anisotropy: fixtureAnisotropy },
    "jewels.normal": { image: jewels.normal, anisotropy: fixtureAnisotropy },
    "bench.rough": { image: bench.rough, repeat: 4, anisotropy: 4 },
    "bench.alpha": { image: bench.alpha },
    "digits.field": { image: makeDigitField(), clamp: true, anisotropy: 8 },
  };
}

/**
 * Makes a brushed set tile in u: the columns either side of the wrap are
 * cross-faded with the columns half a plate away, so the seam lands on
 * continuous streaks instead of a line where every streak stops.
 */
function blendSeam(set: BrushedSet, band: number) {
  for (const canvas of [set.albedo, set.rough, set.normal]) {
    const size = canvas.width;
    const ctx = ctxOf(canvas);
    const src = ctx.getImageData(0, 0, size, size).data;
    const out = ctx.createImageData(size, size);
    out.data.set(src);
    const half = size / 2;
    for (let y = 0; y < size; y++) {
      for (let k = 0; k < band; k++) {
        // Right edge: fade toward the middle as x -> size.
        const w1 = (k + 0.5) / band;
        const x1 = size - band + k;
        const i1 = (y * size + x1) * 4;
        const j1 = (y * size + (x1 - half)) * 4;
        // Left edge: fade away from the middle as x -> band.
        const w0 = 1 - w1;
        const i0 = (y * size + k) * 4;
        const j0 = (y * size + (k + half)) * 4;
        for (let c = 0; c < 3; c++) {
          out.data[i1 + c] = src[i1 + c] * (1 - w1) + src[j1 + c] * w1;
          out.data[i0 + c] = src[i0 + c] * (1 - w0) + src[j0 + c] * w0;
        }
      }
    }
    ctx.putImageData(out, 0, 0);
  }
}

/* ---------------------------------------------------------------- crackle */

/**
 * Crackle-finish paint: Worley cells on a periodic grid, each cell a raised
 * island with a bevelled, darkened rim, the way stove-enamel crackle dries.
 * One texture unit is meant to cover ~0.5 scene units (see the pedestal UVs).
 */
function makeCrackle(size: number, seed: number): { albedo: Surface; rough: Surface; normal: Surface } {
  const cells = 14;
  const random = rng(seed);
  const feature = new Float32Array(cells * cells * 2);
  const cellTint = new Float32Array(cells * cells);
  for (let i = 0; i < cells * cells; i++) {
    feature[i * 2] = random();
    feature[i * 2 + 1] = random();
    cellTint[i] = random();
  }
  const base = srgbToLinear(CRACKLE_COLOR);
  const [albedo, actx] = makeCanvas(size);
  const [rough, rctx] = makeCanvas(size);
  const [height, hctx] = makeCanvas(size);
  const a = actx.createImageData(size, size);
  const r = rctx.createImageData(size, size);
  const h = hctx.createImageData(size, size);
  const smooth = (t: number) => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = ((x + 0.5) / size) * cells;
      const v = ((y + 0.5) / size) * cells;
      const cx = Math.floor(u);
      const cy = Math.floor(v);
      let f1 = 1e9;
      let f2 = 1e9;
      let id = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const gx = cx + dx;
          const gy = cy + dy;
          const idx = (((gy % cells) + cells) % cells) * cells + (((gx % cells) + cells) % cells);
          const px = gx + feature[idx * 2];
          const py = gy + feature[idx * 2 + 1];
          const d = (u - px) * (u - px) + (v - py) * (v - py);
          if (d < f1) {
            f2 = f1;
            f1 = d;
            id = idx;
          } else if (d < f2) {
            f2 = d;
          }
        }
      }
      f1 = Math.sqrt(f1);
      f2 = Math.sqrt(f2);
      // Distance to the cell border; the bevel eases it over ~5% of a cell,
      // so the cracks read as hairlines in the paint, not as grout.
      const edge = f2 - f1;
      const bevel = smooth(edge / 0.1);
      const dome = 1 - Math.min(1, f1 * 1.4) * 0.25;
      const tint = 0.95 + cellTint[id] * 0.1;
      const level = (0.45 + 0.55 * bevel * dome) * 255;
      const shade = (0.7 + 0.3 * bevel) * tint;
      const i = (y * size + x) * 4;
      // Shade in linear light, encode once here: dark paint quantised in
      // 8-bit linear would band.
      a.data[i] = toSrgbByte(base[0] * shade + 0.004 * bevel);
      a.data[i + 1] = toSrgbByte(base[1] * shade + 0.004 * bevel);
      a.data[i + 2] = toSrgbByte(base[2] * shade + 0.004 * bevel);
      a.data[i + 3] = 255;
      const rv = (0.72 + 0.16 * (1 - bevel)) * 255;
      r.data[i] = r.data[i + 1] = r.data[i + 2] = rv;
      r.data[i + 3] = 255;
      h.data[i] = h.data[i + 1] = h.data[i + 2] = level;
      h.data[i + 3] = 255;
    }
  }
  actx.putImageData(a, 0, 0);
  rctx.putImageData(r, 0, 0);
  hctx.putImageData(h, 0, 0);
  return { albedo, rough, normal: heightToNormal(height, 2.2) };
}

function srgbToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return [channel((n >> 16) & 255), channel((n >> 8) & 255), channel(n & 255)];
}

function toSrgbByte(linear: number): number {
  const l = Math.min(1, Math.max(0, linear));
  const s = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

/* ------------------------------------------------------------- bezel face */

/**
 * The bezel's flat front annulus: radially brushed (concentric turning
 * marks on a planar disc UV), with the bank scale engraved into the same
 * height field and paint-filled. The anisotropy map turns the highlight
 * tangentially at every point and switches it off inside the paint; the
 * metalness map makes the paint a dielectric sitting in a metal groove.
 */
function makeBezelFace(size: number): { albedo: Surface; rough: Surface; normal: Surface; metal: Surface; aniso: Surface } {
  const brushed = makeBrushed({ size, direction: "radial", ...TURNED, seed: 175 });
  const uvRadius = BEZEL.meanRadius + BEZEL.radial / 2 - BEZEL.chamfer;
  const engraving = makeEngraving(size, (ctx, s) => drawBankScale(ctx, s, uvRadius));

  // Cut the grooves into the brushed height so one normal map carries both.
  const hctx = ctxOf(brushed.height);
  hctx.globalCompositeOperation = "multiply";
  hctx.drawImage(engraving.height, 0, 0);
  hctx.globalCompositeOperation = "source-over";
  const normal = heightToNormal(brushed.height, 2.4);

  // Paint in the grooves: albedo and roughness from the toolkit.
  stampInk({ albedo: brushed.albedo, rough: brushed.rough }, engraving.mask, PAINT_COLOR, 0.55);
  const [metal, mctx] = makeCanvas(size, "#fff");
  mctx.globalCompositeOperation = "difference";
  mctx.drawImage(engraving.mask, 0, 0);
  mctx.globalCompositeOperation = "source-over";
  const aniso = makeTangentialAnisotropy(Math.min(size, 512), engraving.mask);
  return { albedo: brushed.albedo, rough: brushed.rough, normal, metal, aniso };
}

/** rg = tangential direction around the disc centre, b = strength (0 in the paint). */
function makeTangentialAnisotropy(size: number, mask: Surface): Surface {
  const [, sctx] = makeCanvas(size);
  sctx.drawImage(mask, 0, 0, size, size);
  const m = sctx.getImageData(0, 0, size, size).data;
  const [canvas, ctx] = makeCanvas(size);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - size / 2;
      const dy = size / 2 - (y + 0.5);
      const len = Math.hypot(dx, dy) || 1;
      const i = (y * size + x) * 4;
      img.data[i] = ((-dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = 255 - m[i];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ------------------------------------------------------------------ glass */

/** Six finger smudges and a few dust specks, visible only where light grazes. */
function makeGlassRoughness(size: number, seed: number): Surface {
  const random = rng(seed);
  const base = Math.round(0.05 * 255);
  const [canvas, ctx] = makeCanvas(size, `rgb(${base},${base},${base})`);
  for (let i = 0; i < 6; i++) {
    const cx = (0.15 + random() * 0.7) * size;
    const cy = (0.15 + random() * 0.7) * size;
    const rx = size * (0.08 + random() * 0.14);
    const ry = rx * (0.4 + random() * 0.5);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(random() * Math.PI);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, "rgba(255,255,255,0.08)");
    g.addColorStop(0.7, "rgba(255,255,255,0.05)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 40; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 0.6 + random() * 1.6;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

/* ------------------------------------------------------ stand and bench */

/** The pedestal's crackle paint: Worley cells with a darkened bevel at every edge. */
function makeStandCrackle(size: number): Surface {
  const random = rng(172);
  const cells = 48;
  const seeds: [number, number][] = [];
  for (let i = 0; i < cells; i++) seeds.push([random() * size, random() * size]);
  const [height, hctx] = makeCanvas(size, "#808080");
  const img = hctx.createImageData(size, size);
  const noise = makeValueNoise(9, 8);
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f1 = Infinity;
      let f2 = Infinity;
      for (let s = 0; s < cells; s++) {
        let dx = Math.abs(x - seeds[s][0]);
        let dy = Math.abs(y - seeds[s][1]);
        if (dx > half) dx = size - dx;
        if (dy > half) dy = size - dy;
        const d = dx * dx + dy * dy;
        if (d < f1) {
          f2 = f1;
          f1 = d;
        } else if (d < f2) f2 = d;
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

/** The bench: a matte surface whose roughness varies so any reflection breaks up, and its own edge vignette. */
function makeBench(size: number): { rough: Surface; alpha: Surface } {
  const fbm = makeFbm(41, 4, 4);
  const [rough, rctx] = makeCanvas(size);
  const img = rctx.createImageData(size, size);
  const cx = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(x / size, y / size);
      // Faint concentric turning marks about the centre.
      const r = Math.hypot(x - cx, y - cx);
      const rings = 0.012 * Math.sin(r * 0.9);
      const v = Math.round(Math.min(1, Math.max(0, 0.62 + n * 0.18 + rings)) * 255);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  rctx.putImageData(img, 0, 0);

  // The floor's own vignette: the edge of the disc must never be seen.
  const [alpha, actx] = makeCanvas(512, "#000");
  const gradient = actx.createRadialGradient(256, 256, 256 * 0.35, 256, 256, 256);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(255,255,255,1)");
  actx.fillStyle = gradient;
  actx.fillRect(0, 0, 512, 512);
  return { rough, alpha };
}
