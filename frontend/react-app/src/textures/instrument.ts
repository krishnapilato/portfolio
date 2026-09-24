import { Color, MeshPhysicalMaterial, Vector2, type Texture } from "three";
import type { Tier } from "../lib/store";
import { makeBrushed, type BrushedSet } from "./brushed";
import { heightToNormal, makeCanvas, rng, toTexture } from "./canvas";
import { makeEngraving, stampInk, type Engraver } from "./engrave";

/**
 * Shared materials and textures for the machined parts of the instrument.
 * Everything here is deterministic (seeded) and sized per tier; the set is
 * cached by tier so the app and the harness share one upload.
 */

/** Brushed-metal map size per tier (the maps the macro beats magnify). */
// 1024 on the high tier too: 2048 quadruples the boot cost for streak density only visible at the macro.
export const MAP_SIZE: Record<Tier, number> = { high: 1024, mid: 1024, low: 512 };
/** Size of the secondary maps (crackle paint, glass smudges). */
export const DETAIL_SIZE: Record<Tier, number> = { high: 1024, mid: 512, low: 256 };
/** Texture anisotropic filtering per tier so grazing macro angles stay clean. */
export const TEXTURE_ANISOTROPY: Record<Tier, number> = { high: 8, mid: 4, low: 2 };

export type InstrumentMaterials = {
  /**
   * Lathe-turned aluminium (gimbal rings, bezel body). The streaks run along
   * texture u, which lathe UVs map to the circumference, and the anisotropy
   * follows the same direction, so highlights stretch around the ring the
   * way they do on real turned stock. (The canvas is drawn "linear" because
   * the lathe UV already unwraps the circle; "radial" arcs are for planar
   * disc faces, see makeBezelFace.)
   */
  aluminiumRadial: MeshPhysicalMaterial;
  /** Milled aluminium bars (ribs, spider, hub): streaks and anisotropy along the length. */
  aluminiumLinear: MeshPhysicalMaterial;
  /** Turned steel (pivot pins, bolt heads, stem, ball joint): cooler tint, a touch rougher. */
  steel: MeshPhysicalMaterial;
  /** Crackle-finish paint for the pedestal. */
  crackle: MeshPhysicalMaterial;
  /** Disposes every texture and material of this tier and drops it from the cache. */
  dispose: () => void;
};

const TURNED = { tint: "#b9bcc2", grain: 0.55, roughness: 0.3, scratches: 0.3 };
const MILLED = { tint: "#b9bcc2", grain: 0.62, roughness: 0.32, scratches: 0.35 };
const STEEL_TINT = "#9ea3a8";
const STEEL_ROUGHNESS = 0.35;
const CRACKLE_COLOR = "#151A20";
export const PAINT_COLOR = "#EEF1F4";

const cache = new Map<Tier, InstrumentMaterials>();

export function getInstrumentMaterials(tier: Tier): InstrumentMaterials {
  const cached = cache.get(tier);
  if (cached) return cached;

  const size = MAP_SIZE[tier];
  const anisotropy = TEXTURE_ANISOTROPY[tier];
  const turned = makeBrushed({ size, direction: "linear", ...TURNED, seed: 172, anisotropy });
  const milled = makeBrushed({ size, direction: "linear", ...MILLED, seed: 173, anisotropy });
  // Lathe and bar UVs wrap in u; the streak canvases do not, so the wrap
  // seam is cross-faded into the plate's own middle (see blendSeam).
  for (const set of [turned, milled]) blendSeam(set, Math.round(size / 24));
  const paint = makeCrackle(DETAIL_SIZE[tier], 174, anisotropy);

  const aluminiumRadial = metal(turned, { anisotropy: 0.8, clearcoat: 0.2 });
  const aluminiumLinear = metal(milled, { anisotropy: 0.7, clearcoat: 0.15 });
  const steel = metal(turned, {
    color: tintRatio(STEEL_TINT, TURNED.tint),
    roughness: STEEL_ROUGHNESS / TURNED.roughness,
    anisotropy: 0.6,
    clearcoat: 0.15,
  });
  const crackle = new MeshPhysicalMaterial({
    map: paint.map,
    roughnessMap: paint.roughnessMap,
    normalMap: paint.normalMap,
    normalScale: new Vector2(0.9, 0.9),
    metalness: 0,
    roughness: 1,
    clearcoat: 0.06,
    clearcoatRoughness: 0.7,
    envMapIntensity: 0.6,
  });

  const set: InstrumentMaterials = {
    aluminiumRadial,
    aluminiumLinear,
    steel,
    crackle,
    dispose() {
      for (const s of [turned, milled]) {
        s.map.dispose();
        s.roughnessMap.dispose();
        s.normalMap.dispose();
      }
      paint.dispose();
      for (const m of [aluminiumRadial, aluminiumLinear, steel, crackle]) m.dispose();
      cache.delete(tier);
    },
  };
  cache.set(tier, set);
  return set;
}

function metal(
  set: BrushedSet,
  options: { color?: Color; roughness?: number; anisotropy: number; clearcoat: number },
): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    map: set.map,
    roughnessMap: set.roughnessMap,
    normalMap: set.normalMap,
    normalScale: new Vector2(0.6, 0.6),
    color: options.color ?? new Color(1, 1, 1),
    metalness: 1,
    // The roughness map carries the finish; the scalar only rescales it.
    roughness: options.roughness ?? 1,
    anisotropy: options.anisotropy,
    anisotropyRotation: 0,
    clearcoat: options.clearcoat,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1,
  });
}

/** Linear multiplier that turns a map baked in `base` tint into `target` tint. */
function tintRatio(target: string, base: string): Color {
  const t = new Color(target);
  const b = new Color(base);
  return new Color(t.r / b.r, t.g / b.g, t.b / b.b);
}

/**
 * Makes a brushed set tile in u: the columns either side of the wrap are
 * cross-faded with the columns half a plate away, so the seam lands on
 * continuous streaks instead of a line where every streak stops.
 */
function blendSeam(set: BrushedSet, band: number) {
  for (const canvas of [set.canvases.albedo, set.canvases.rough, set.canvases.normal]) {
    const size = canvas.width;
    const ctx = canvas.getContext("2d")!;
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
  set.map.needsUpdate = true;
  set.roughnessMap.needsUpdate = true;
  set.normalMap.needsUpdate = true;
}

/* ---------------------------------------------------------------- crackle */

export type CrackleSet = {
  map: Texture;
  roughnessMap: Texture;
  normalMap: Texture;
  dispose: () => void;
};

/**
 * Crackle-finish paint: Worley cells on a periodic grid, each cell a raised
 * island with a bevelled, darkened rim, the way stove-enamel crackle dries.
 * One texture unit is meant to cover ~0.5 scene units (see the pedestal UVs).
 */
export function makeCrackle(size: number, seed: number, anisotropy: number): CrackleSet {
  const cells = 14;
  const random = rng(seed);
  const feature = new Float32Array(cells * cells * 2);
  const cellTint = new Float32Array(cells * cells);
  for (let i = 0; i < cells * cells; i++) {
    feature[i * 2] = random();
    feature[i * 2 + 1] = random();
    cellTint[i] = random();
  }
  const base = new Color(CRACKLE_COLOR);
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
      // Shade in linear light (Color decoded the sRGB hex), encode once here:
      // dark paint quantised in 8-bit linear would band.
      a.data[i] = toSrgbByte(base.r * shade + 0.004 * bevel);
      a.data[i + 1] = toSrgbByte(base.g * shade + 0.004 * bevel);
      a.data[i + 2] = toSrgbByte(base.b * shade + 0.004 * bevel);
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
  const normal = heightToNormal(height, 2.2);
  const map = toTexture(albedo, { color: true, anisotropy });
  const roughnessMap = toTexture(rough, { anisotropy });
  const normalMap = toTexture(normal, { anisotropy });
  return {
    map,
    roughnessMap,
    normalMap,
    dispose() {
      map.dispose();
      roughnessMap.dispose();
      normalMap.dispose();
    },
  };
}

function toSrgbByte(linear: number): number {
  const l = Math.min(1, Math.max(0, linear));
  const s = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

/* ------------------------------------------------------------- bezel face */

export type BezelFace = { material: MeshPhysicalMaterial; dispose: () => void };

/**
 * The bezel's flat front annulus: radially brushed (concentric turning
 * marks on a planar disc UV), with the bank scale engraved into the same
 * height field and paint-filled. The anisotropy map turns the highlight
 * tangentially at every point and switches it off inside the paint.
 */
export function makeBezelFace(tier: Tier, engrave: Engraver, paint = PAINT_COLOR): BezelFace {
  const size = MAP_SIZE[tier];
  const anisotropy = TEXTURE_ANISOTROPY[tier];
  const brushed = makeBrushed({ size, direction: "radial", ...TURNED, seed: 175, anisotropy });
  const engraving = makeEngraving(size, engrave, 3);
  engraving.normalMap.dispose();
  engraving.maskMap.dispose();

  // Cut the grooves into the brushed height so one normal map carries both.
  const hctx = brushed.canvases.height.getContext("2d")!;
  hctx.globalCompositeOperation = "multiply";
  hctx.drawImage(engraving.height, 0, 0);
  hctx.globalCompositeOperation = "source-over";
  brushed.normalMap.dispose();
  const normalMap = toTexture(heightToNormal(brushed.canvases.height, 2.4), { anisotropy });

  // Paint in the grooves: albedo and roughness from the toolkit, metalness
  // here, because enamel is a dielectric sitting in a metal groove.
  stampInk(brushed.canvases, engraving.mask, paint, 0.55);
  brushed.map.needsUpdate = true;
  brushed.roughnessMap.needsUpdate = true;
  const [metalCanvas, mctx] = makeCanvas(size, "#fff");
  mctx.globalCompositeOperation = "difference";
  mctx.drawImage(engraving.mask, 0, 0);
  mctx.globalCompositeOperation = "source-over";
  const metalnessMap = toTexture(metalCanvas, { anisotropy });
  const anisotropyMap = makeTangentialAnisotropy(Math.min(size, 512), engraving.mask);

  const material = new MeshPhysicalMaterial({
    map: brushed.map,
    roughnessMap: brushed.roughnessMap,
    metalnessMap,
    normalMap,
    normalScale: new Vector2(0.7, 0.7),
    anisotropyMap,
    anisotropy: 0.8,
    metalness: 1,
    roughness: 1,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1,
  });
  return {
    material,
    dispose() {
      brushed.map.dispose();
      brushed.roughnessMap.dispose();
      normalMap.dispose();
      metalnessMap.dispose();
      anisotropyMap.dispose();
      material.dispose();
    },
  };
}

/** rg = tangential direction around the disc centre, b = strength (0 in the paint). */
function makeTangentialAnisotropy(size: number, mask: HTMLCanvasElement): Texture {
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
  return toTexture(canvas, { anisotropy: 2 });
}

/* ------------------------------------------------------------------ glass */

export type GlassSet = { material: MeshPhysicalMaterial; dispose: () => void };

/**
 * Cover glass. On the high tier it is real transmission with a 0.06 slab;
 * below that a transparent physical material with no transmission, so the
 * disc costs one draw and no extra scene pass. The roughness map carries
 * six finger smudges and a few dust specks, visible only where light grazes.
 */
export function makeGlass(tier: Tier): GlassSet {
  const roughnessMap = makeGlassRoughness(DETAIL_SIZE[tier], 176, TEXTURE_ANISOTROPY[tier]);
  const material =
    tier === "high"
      ? new MeshPhysicalMaterial({
          transmission: 1,
          thickness: 0.06,
          ior: 1.5,
          roughness: 1,
          roughnessMap,
          metalness: 0,
          specularIntensity: 1,
          envMapIntensity: 1,
        })
      : new MeshPhysicalMaterial({
          transparent: true,
          opacity: 0.08,
          depthWrite: false,
          roughness: 1,
          roughnessMap,
          metalness: 0,
          specularIntensity: 1,
          envMapIntensity: 1,
        });
  return {
    material,
    dispose() {
      roughnessMap.dispose();
      material.dispose();
    },
  };
}

function makeGlassRoughness(size: number, seed: number, anisotropy: number): Texture {
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
  return toTexture(canvas, { anisotropy });
}
