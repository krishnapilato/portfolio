import { Color, MeshPhysicalMaterial, Vector2, type Texture } from "three";
import type { Tier } from "../lib/store";
import { getMaps } from "./library";

/**
 * Materials for the machined parts of the instrument, assembled from the
 * tier's generated maps (see maps.ts, built off the main thread). Cached
 * per tier so every part shares one set of programs and uploads.
 */

export type InstrumentMaterials = {
  /**
   * Lathe-turned aluminium (gimbal rings, bezel body). The streaks run along
   * texture u, which lathe UVs map to the circumference, and the anisotropy
   * follows the same direction, so highlights stretch around the ring the
   * way they do on real turned stock.
   */
  aluminiumRadial: MeshPhysicalMaterial;
  /** Milled aluminium bars (ribs, spider, hub): streaks and anisotropy along the length. */
  aluminiumLinear: MeshPhysicalMaterial;
  /** Turned steel (pivot pins, bolt heads, stem, ball joint): cooler tint, a touch rougher. */
  steel: MeshPhysicalMaterial;
  /** Crackle-finish paint for the pedestal. */
  crackle: MeshPhysicalMaterial;
};

const TURNED_TINT = "#b9bcc2";
const TURNED_ROUGHNESS = 0.3;
const STEEL_TINT = "#9ea3a8";
const STEEL_ROUGHNESS = 0.35;

const cache = new Map<Tier, InstrumentMaterials>();

export function getInstrumentMaterials(tier: Tier): InstrumentMaterials {
  const cached = cache.get(tier);
  if (cached) return cached;
  const maps = getMaps(tier);
  const turned = { map: maps["turned.map"], rough: maps["turned.rough"], normal: maps["turned.normal"] };
  const milled = { map: maps["milled.map"], rough: maps["milled.rough"], normal: maps["milled.normal"] };

  const set: InstrumentMaterials = {
    aluminiumRadial: metal(turned, { anisotropy: 0.8, clearcoat: 0.2 }),
    aluminiumLinear: metal(milled, { anisotropy: 0.7, clearcoat: 0.15 }),
    steel: metal(turned, {
      color: tintRatio(STEEL_TINT, TURNED_TINT),
      roughness: STEEL_ROUGHNESS / TURNED_ROUGHNESS,
      anisotropy: 0.6,
      clearcoat: 0.15,
    }),
    crackle: new MeshPhysicalMaterial({
      map: maps["crackle.map"],
      roughnessMap: maps["crackle.rough"],
      normalMap: maps["crackle.normal"],
      normalScale: new Vector2(0.9, 0.9),
      metalness: 0,
      roughness: 1,
      clearcoat: 0.06,
      clearcoatRoughness: 0.7,
      envMapIntensity: 0.6,
    }),
  };
  cache.set(tier, set);
  return set;
}

function metal(
  maps: { map: Texture; rough: Texture; normal: Texture },
  options: { color?: Color; roughness?: number; anisotropy: number; clearcoat: number },
): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    map: maps.map,
    roughnessMap: maps.rough,
    normalMap: maps.normal,
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
 * Brushed metal of the bench fixture (stand, cradle, jewel settings): the
 * material tints a neutral plate, so only roughness and normal are mapped.
 */
export function makeFixtureMetal(tier: Tier, part: "stand" | "cradle" | "jewels", normalScale: number): MeshPhysicalMaterial {
  const maps = getMaps(tier);
  return new MeshPhysicalMaterial({
    color: "#b9bec4",
    metalness: 1,
    roughness: 1,
    roughnessMap: maps[`${part}.rough`],
    normalMap: maps[`${part}.normal`],
    normalScale: new Vector2(normalScale, normalScale),
    anisotropy: tier === "low" ? 0 : 0.8,
    envMapIntensity: 1,
  });
}

/**
 * The bezel's flat front annulus: radially brushed, with the bank scale
 * engraved and paint-filled. The metalness map makes the paint a
 * dielectric in a metal groove; the anisotropy map turns the highlight
 * tangentially and switches it off inside the paint.
 */
export function makeBezelFace(tier: Tier): MeshPhysicalMaterial {
  const maps = getMaps(tier);
  return new MeshPhysicalMaterial({
    map: maps["bezel.map"],
    roughnessMap: maps["bezel.rough"],
    metalnessMap: maps["bezel.metal"],
    normalMap: maps["bezel.normal"],
    normalScale: new Vector2(0.7, 0.7),
    anisotropyMap: maps["bezel.aniso"],
    anisotropy: 0.8,
    metalness: 1,
    roughness: 1,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1,
  });
}

/**
 * Cover glass. With `transmission` it is real refracting glass with a
 * 0.06 slab (an extra scene pass, so only the high quality level asks for
 * it); otherwise a transparent physical material with no transmission, so
 * the disc costs one draw. Never writes depth: the depth of field reads the
 * dial behind it, not the glass. The roughness map carries six finger
 * smudges and a few dust specks, visible only where light grazes.
 */
export function makeGlass(tier: Tier, transmission: boolean): MeshPhysicalMaterial {
  const roughnessMap = getMaps(tier)["glass.rough"];
  return transmission
    ? new MeshPhysicalMaterial({
        transmission: 1,
        thickness: 0.06,
        ior: 1.5,
        roughness: 1,
        roughnessMap,
        metalness: 0,
        specularIntensity: 1,
        envMapIntensity: 1,
        depthWrite: false,
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
}
