import {
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  RingGeometry,
  Shape,
  Vector2,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Geometry builders for the machined parts. All of them put texture u along
 * the machining direction (around a lathe, along a bar) so brushed streaks
 * and the material's anisotropy follow the tool, and duplicate profile
 * corners so chamfers shade as hard edges instead of smoothed bevels.
 */

export type Profile = Vector2[];

/** Pushes a profile corner twice so the lathe shades it as a hard edge. */
function corner(points: Profile, x: number, y: number) {
  points.push(new Vector2(x, y), new Vector2(x, y));
}

export type RingSpec = {
  meanRadius: number;
  /** Radial thickness of the section. */
  radial: number;
  /** Axial width of the section. */
  axial: number;
  chamfer: number;
};

/**
 * Chamfered rectangular ring section as a lathe profile, counter-clockwise
 * in (radius, axial) so the lathe's normals face out of the metal. Closed:
 * starts and ends mid back face. Open front: leaves the front flat out for
 * a planar face mesh to fill (see makeRingFace).
 */
export function ringProfile(spec: RingSpec, openFront = false): Profile {
  const { meanRadius: R, radial: t, axial: w, chamfer: c } = spec;
  const ro = R + t / 2;
  const ri = R - t / 2;
  const yf = w / 2;
  const yb = -w / 2;
  const points: Profile = [];
  if (openFront) {
    points.push(new Vector2(ri + c, yf));
    corner(points, ri, yf - c);
    corner(points, ri, yb + c);
    corner(points, ri + c, yb);
    corner(points, ro - c, yb);
    corner(points, ro, yb + c);
    corner(points, ro, yf - c);
    points.push(new Vector2(ro - c, yf));
  } else {
    points.push(new Vector2(R, yb));
    corner(points, ro - c, yb);
    corner(points, ro, yb + c);
    corner(points, ro, yf - c);
    corner(points, ro - c, yf);
    corner(points, ri + c, yf);
    corner(points, ri, yf - c);
    corner(points, ri, yb + c);
    corner(points, ri + c, yb);
    points.push(new Vector2(R, yb));
  }
  return points;
}

export type LatheOptions = {
  segments: number;
  /** Times the texture repeats around; default keeps texels ~3x longer along u than v. */
  uRepeat?: number;
  /** When set, UVs are scene units / worldTile in both directions (tiling paint). */
  worldTile?: number;
};

/**
 * LatheGeometry (axis +Y) with arc-length v, so chamfers and flats share one
 * texel density, and u = angle times the chosen repeat.
 */
export function makeLathe(points: Profile, options: LatheOptions): LatheGeometry {
  const { segments } = options;
  const geo = new LatheGeometry(points, segments, 0, Math.PI * 2);
  const cum = [0];
  let maxRadius = 0;
  for (let i = 1; i < points.length; i++) cum[i] = cum[i - 1] + points[i].distanceTo(points[i - 1]);
  for (const p of points) maxRadius = Math.max(maxRadius, p.x);
  const length = cum[cum.length - 1] || 1;
  const circumference = 2 * Math.PI * maxRadius;
  let uScale: number;
  let vScale: number;
  if (options.worldTile) {
    uScale = circumference / options.worldTile;
    vScale = length / options.worldTile;
  } else {
    uScale = options.uRepeat ?? Math.max(1, Math.round(circumference / (length * 3)));
    vScale = 1;
  }
  const uv = geo.attributes.uv;
  const n = points.length;
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j < n; j++) {
      uv.setXY(i * n + j, (i / segments) * uScale, (cum[j] / length) * vScale);
    }
  }
  return geo;
}

/** A ring whose axis is +Z, front (+axial) toward +Z; the lathe seam sits at 6 o'clock. */
export function makeRing(spec: RingSpec, options: LatheOptions & { openFront?: boolean }): LatheGeometry {
  const geo = makeLathe(ringProfile(spec, options.openFront), options);
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** Outer radius of a ring's front flat, which is also the disc radius of its planar UVs. */
export function ringFaceRadius(spec: RingSpec): number {
  return spec.meanRadius + spec.radial / 2 - spec.chamfer;
}

/**
 * The planar front annulus of an open-front ring (uv = 0.5 + xy / (2 *
 * ringFaceRadius)), for a face that carries an engraving.
 */
export function makeRingFace(spec: RingSpec, segments: number): RingGeometry {
  const geo = new RingGeometry(spec.meanRadius - spec.radial / 2 + spec.chamfer, ringFaceRadius(spec), segments, 1);
  geo.translate(0, 0, spec.axial / 2);
  return geo;
}

/** Turned cylinder with chamfered ends as a lathe profile (axis Y, centred). */
export function cylinderProfile(radius: number, length: number, chamfer: number): Profile {
  const h = length / 2;
  const c = Math.min(chamfer, radius * 0.4, h * 0.4);
  const points: Profile = [new Vector2(0, -h)];
  corner(points, radius - c, -h);
  corner(points, radius, -h + c);
  corner(points, radius, h - c);
  corner(points, radius - c, h);
  points.push(new Vector2(0, h));
  return points;
}

export type PinSpec = {
  radius: number;
  length: number;
  chamfer: number;
  /** Collar (shoulder) on the +Y half: radius and axial extent from the centre. */
  collar: { radius: number; from: number; to: number };
};

/** Pivot pin: turned, chamfered ends, a collar that seats against the ring it enters at +Y. */
export function pinProfile(spec: PinSpec): Profile {
  const { radius: r, chamfer: c, collar } = spec;
  const h = spec.length / 2;
  const points: Profile = [new Vector2(0, -h)];
  corner(points, r - c, -h);
  corner(points, r, -h + c);
  corner(points, r, collar.from);
  corner(points, collar.radius, collar.from);
  corner(points, collar.radius, collar.to);
  corner(points, r, collar.to);
  corner(points, r, h - c);
  corner(points, r - c, h);
  points.push(new Vector2(0, h));
  return points;
}

/**
 * Chamfered bar along +Z, centred at the origin, hard edged, non-indexed.
 * u runs along the length so brushed streaks and anisotropy follow it.
 */
export function makeBar(
  length: number,
  width: number,
  height: number,
  chamfer = 0.006,
  uRepeat?: number,
): BufferGeometry {
  const hw = width / 2;
  const hh = height / 2;
  const c = Math.min(chamfer, hw * 0.45, hh * 0.45);
  const ring: [number, number][] = [
    [hw - c, -hh],
    [hw, -hh + c],
    [hw, hh - c],
    [hw - c, hh],
    [-hw + c, hh],
    [-hw, hh - c],
    [-hw, -hh + c],
    [-hw + c, -hh],
  ];
  const n = ring.length;
  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    perimeter += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  const repeat = uRepeat ?? Math.max(1, Math.round(length / (perimeter * 3)));
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const z0 = -length / 2;
  const z1 = length / 2;
  let along = 0;
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const nx = dy / len;
    const ny = -dx / len;
    const v0 = along / perimeter;
    const v1 = (along + len) / perimeter;
    along += len;
    const quad = [
      [a[0], a[1], z0, 0, v0],
      [b[0], b[1], z0, 0, v1],
      [a[0], a[1], z1, repeat, v0],
      [b[0], b[1], z0, 0, v1],
      [b[0], b[1], z1, repeat, v1],
      [a[0], a[1], z1, repeat, v0],
    ];
    for (const [x, y, z, u, v] of quad) {
      pos.push(x, y, z);
      nor.push(nx, ny, 0);
      uv.push(u, v);
    }
  }
  for (const [z, sign] of [
    [z1, 1],
    [z0, -1],
  ] as const) {
    for (let i = 0; i < n; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      const tri: [number, number][] = sign > 0 ? [[0, 0], a, b] : [[0, 0], b, a];
      for (const [x, y] of tri) {
        pos.push(x, y, z);
        nor.push(0, 0, sign);
        uv.push(0.5 + x / width, 0.5 + y / height);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return geo;
}

/** Extruded isosceles triangle in the XY plane (base at y=base, apex at y=tip), z from 0 to depth. */
export function makeTriangle(base: number, tip: number, halfWidth: number, depth: number): ExtrudeGeometry {
  const shape = new Shape();
  shape.moveTo(-halfWidth, base);
  shape.lineTo(halfWidth, base);
  shape.lineTo(0, tip);
  shape.closePath();
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
}

/** Hex bolt head with a chamfered crown, axis Y, base at y=0, flat faceted. */
export function makeHexHead(radius: number, height: number): BufferGeometry {
  const body = new CylinderGeometry(radius, radius, height * 0.72, 6, 1, false);
  body.translate(0, height * 0.36, 0);
  const crown = new CylinderGeometry(radius * 0.8, radius, height * 0.28, 6, 1, false);
  crown.translate(0, height * 0.86, 0);
  const merged = mergeParts([body, crown]);
  merged.computeVertexNormals();
  return merged;
}

/**
 * Open-bottom pedestal: turned side with a chamfered top rim plus a planar
 * top cap, UVs in scene units / worldTile so a tiling paint stays isotropic.
 */
export function makePedestal(
  radius: number,
  height: number,
  chamfer: number,
  segments: number,
  worldTile: number,
): BufferGeometry {
  const h = height / 2;
  const points: Profile = [new Vector2(radius, -h)];
  corner(points, radius, h - chamfer);
  points.push(new Vector2(radius - chamfer, h));
  const side = makeLathe(points, { segments, worldTile });
  const cap = new CircleGeometry(radius - chamfer, segments);
  cap.rotateX(-Math.PI / 2);
  cap.translate(0, h, 0);
  const p = cap.attributes.position;
  const uv = cap.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / worldTile, p.getZ(i) / worldTile);
  return mergeParts([side, cap]);
}

function flat(geo: BufferGeometry): BufferGeometry {
  return geo.index ? geo.toNonIndexed() : geo;
}

/** Merges parts into one static geometry (one draw call) and disposes the parts. */
export function mergeParts(parts: BufferGeometry[]): BufferGeometry {
  const flats = parts.map(flat);
  const merged = mergeGeometries(flats, false);
  if (!merged) throw new Error("mergeParts: incompatible geometries");
  for (const g of flats) g.dispose();
  for (const g of parts) g.dispose();
  return merged;
}
