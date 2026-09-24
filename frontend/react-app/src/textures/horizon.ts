import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  NoColorSpace,
  type IUniform,
  type WebGLProgramParametersWithUniforms,
} from "three";

/** Palette of the horizon sphere (sRGB hex; `Color` converts to linear). */
export const HORIZON_SKY = "#2E4A66";
export const HORIZON_EARTH = "#7A4E2B";
export const HORIZON_INK = "#EEF1F4";

/** Digit atlas layout: ten cells of 51.2 x 64 texels, one glyph each. */
export const ATLAS_WIDTH = 512;
export const ATLAS_HEIGHT = 64;
/** Distance-field spread in atlas texels: 0.5 in the texture equals this many texels. */
export const ATLAS_SPREAD = 8;
/** The atlas is rasterised at this multiple and distance-transformed before downsampling. */
const OVERSAMPLE = 2;
const FONT = '700 52px "Helvetica Neue", Arial, "Liberation Sans", sans-serif';

export type DigitAtlas = {
  /** The raw glyph canvas, white on black, as drawn. */
  glyphs: HTMLCanvasElement;
  /** Signed distance field of the glyphs (0.5 = outline), uploaded as a texture. */
  texture: CanvasTexture;
};

/**
 * Builds the numeral atlas for the pitch ladder: "0123456789" in a bold
 * system sans, white on black, then converted to a signed distance field.
 * Why a distance field and not the plain bitmap: the film's macro beats
 * magnify a digit five to six times, where a 52 px bitmap would blur; a
 * distance field thresholded with fwidth stays crisp at any magnification
 * and still mipmaps cleanly at the wide shot.
 */
export function makeDigitAtlas(): DigitAtlas {
  const glyphs = document.createElement("canvas");
  glyphs.width = ATLAS_WIDTH;
  glyphs.height = ATLAS_HEIGHT;
  const gctx = glyphs.getContext("2d");
  if (!gctx) throw new Error("2D canvas unavailable");
  drawDigits(gctx, 1);

  // Oversampled rasterisation for a sub-texel-accurate outline.
  const bigW = ATLAS_WIDTH * OVERSAMPLE;
  const bigH = ATLAS_HEIGHT * OVERSAMPLE;
  const big = document.createElement("canvas");
  big.width = bigW;
  big.height = bigH;
  const bctx = big.getContext("2d", { willReadFrequently: true });
  if (!bctx) throw new Error("2D canvas unavailable");
  drawDigits(bctx, OVERSAMPLE);
  const src = bctx.getImageData(0, 0, bigW, bigH).data;

  // Coverage of the anti-aliased raster; "edge" pixels are the partially
  // covered ones plus any pixel whose 4-neighbour is on the other side of
  // the outline (pixel-aligned edges have no partial pixel between them).
  const cov = new Float32Array(bigW * bigH);
  for (let i = 0; i < cov.length; i++) cov[i] = src[i * 4] / 255;
  const edge = new Uint8Array(bigW * bigH);
  for (let y = 0; y < bigH; y++) {
    for (let x = 0; x < bigW; x++) {
      const i = y * bigW + x;
      const c = cov[i];
      if (c > 0 && c < 1) {
        edge[i] = 1;
        continue;
      }
      const inside = c >= 0.5;
      if (
        (x > 0 && cov[i - 1] >= 0.5 !== inside) ||
        (x < bigW - 1 && cov[i + 1] >= 0.5 !== inside) ||
        (y > 0 && cov[i - bigW] >= 0.5 !== inside) ||
        (y < bigH - 1 && cov[i + bigW] >= 0.5 !== inside)
      ) {
        edge[i] = 1;
      }
    }
  }
  const { dist2, nearest } = edt(edge, bigW, bigH);

  // Downsample the signed distance (in atlas texels) into an 8-bit field.
  // The nearest edge pixel's coverage places the outline to a fraction of
  // a raster pixel: d = +-|P - E| + (coverage(E) - 0.5).
  const field = document.createElement("canvas");
  field.width = ATLAS_WIDTH;
  field.height = ATLAS_HEIGHT;
  const fctx = field.getContext("2d");
  if (!fctx) throw new Error("2D canvas unavailable");
  const out = fctx.createImageData(ATLAS_WIDTH, ATLAS_HEIGHT);
  const norm = 1 / (OVERSAMPLE * OVERSAMPLE);
  for (let y = 0; y < ATLAS_HEIGHT; y++) {
    for (let x = 0; x < ATLAS_WIDTH; x++) {
      let sum = 0;
      for (let sy = 0; sy < OVERSAMPLE; sy++) {
        for (let sx = 0; sx < OVERSAMPLE; sx++) {
          const j = (y * OVERSAMPLE + sy) * bigW + x * OVERSAMPLE + sx;
          const sign = cov[j] >= 0.5 ? 1 : -1;
          sum += sign * Math.sqrt(dist2[j]) + (cov[nearest[j]] - 0.5);
        }
      }
      const signed = (sum * norm) / OVERSAMPLE; // in atlas texels
      const v = Math.round(Math.min(1, Math.max(0, 0.5 + signed / (2 * ATLAS_SPREAD))) * 255);
      const i = (y * ATLAS_WIDTH + x) * 4;
      out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
      out.data[i + 3] = 255;
    }
  }
  fctx.putImageData(out, 0, 0);

  const texture = new CanvasTexture(field);
  texture.colorSpace = NoColorSpace;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { glyphs, texture };
}

function drawDigits(ctx: CanvasRenderingContext2D, scale: number) {
  const w = ATLAS_WIDTH * scale;
  const h = ATLAS_HEIGHT * scale;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.font = FONT.replace("52px", `${52 * scale}px`);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cell = w / 10;
  for (let n = 0; n < 10; n++) {
    ctx.fillText(String(n), cell * (n + 0.5), h * 0.5 + 2 * scale);
  }
}

/**
 * Exact squared Euclidean distance transform (Felzenszwalb & Huttenlocher)
 * to the nearest set pixel of `mask`, with the index of that pixel.
 * Separable, linear time.
 */
function edt(mask: Uint8Array, width: number, height: number): { dist2: Float32Array; nearest: Int32Array } {
  const INF = 1e12;
  const grid = new Float32Array(width * height);
  const nearestX = new Int32Array(width * height);
  const nearest = new Int32Array(width * height);
  for (let i = 0; i < grid.length; i++) grid[i] = mask[i] ? 0 : INF;
  const n = Math.max(width, height);
  const f = new Float32Array(n);
  const d = new Float32Array(n);
  const arg = new Int32Array(n);
  const v = new Int32Array(n);
  const z = new Float32Array(n + 1);

  // One-dimensional pass: lower envelope of parabolas rooted at f.
  const pass1d = (len: number) => {
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < len; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
      arg[q] = v[k];
    }
  };

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) f[x] = grid[row + x];
    pass1d(width);
    for (let x = 0; x < width; x++) {
      grid[row + x] = d[x];
      nearestX[row + x] = arg[x];
    }
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];
    pass1d(height);
    for (let y = 0; y < height; y++) {
      const i = y * width + x;
      grid[i] = d[y];
      nearest[i] = arg[y] * width + nearestX[arg[y] * width + x];
    }
  }
  return { dist2: grid, nearest };
}

/* ------------------------------------------------------------------------ */
/* Shader                                                                    */
/* ------------------------------------------------------------------------ */

const VERTEX_PARS = /* glsl */ `
#include <common>
varying vec3 vHzObj;
`;

const VERTEX_MAIN = /* glsl */ `
#include <begin_vertex>
vHzObj = position;
`;

const FRAGMENT_PARS = /* glsl */ `
#include <common>
varying vec3 vHzObj;
uniform sampler2D uHzDigits;
uniform vec3 uHzSky;
uniform vec3 uHzEarth;
uniform vec3 uHzInk;

// Pixel coverage of a band of half-width hw at distance d, given the screen
// footprint aa of the coordinate: a one-pixel analytic ramp.
float hzCov( float d, float hw, float aa ) {
	return clamp( ( hw - d ) / aa + 0.5, 0.0, 1.0 );
}

// Screen-space footprint of a scalar, in its own units per pixel.
float hzFoot( float v ) {
	return max( length( vec2( dFdx( v ), dFdy( v ) ) ), 1e-5 );
}

float hzHash( vec3 p ) {
	p = fract( p * 0.3183099 + vec3( 0.1, 0.2, 0.3 ) );
	p *= 17.0;
	return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) );
}

float hzNoise( vec3 x ) {
	vec3 i = floor( x );
	vec3 f = fract( x );
	f = f * f * ( 3.0 - 2.0 * f );
	return mix(
		mix( mix( hzHash( i ), hzHash( i + vec3( 1.0, 0.0, 0.0 ) ), f.x ),
		     mix( hzHash( i + vec3( 0.0, 1.0, 0.0 ) ), hzHash( i + vec3( 1.0, 1.0, 0.0 ) ), f.x ), f.y ),
		mix( mix( hzHash( i + vec3( 0.0, 0.0, 1.0 ) ), hzHash( i + vec3( 1.0, 0.0, 1.0 ) ), f.x ),
		     mix( hzHash( i + vec3( 0.0, 1.0, 1.0 ) ), hzHash( i + vec3( 1.0, 1.0, 1.0 ) ), f.x ), f.y ),
		f.z );
}
`;

/**
 * Albedo of the enamel as a function of latitude and longitude, evaluated
 * per fragment. Everything is analytic except the numerals, which come
 * from the distance-field atlas sampled with explicit gradients so the
 * cell jumps never disturb mip selection.
 */
const FRAGMENT_MAIN = /* glsl */ `
#include <map_fragment>
float hzPeel;
{
	vec3 hp = normalize( vHzObj );
	float latD = degrees( asin( clamp( hp.y, -1.0, 1.0 ) ) );
	float lonF = degrees( atan( hp.x, hp.z ) );
	float lonB = degrees( atan( -hp.x, -hp.z ) );
	// Signed longitude from the nearest ladder window centre (front +Z or
	// back -Z); positive is the viewer's right when facing that window.
	float dl = ( abs( lonF ) < abs( lonB ) ) ? lonF : lonB;

	// Derivatives first, outside any branch.
	float aaLat = min( hzFoot( latD ), 2.0 );
	float aaLon = min( hzFoot( dl ), 2.0 );
	// Atlas gradients: u = ( glyph + 0.15 + 0.7 * lu ) / 10 with lu = dl / 5;
	// v = 0.10 + 0.80 * lv with lv = latD / 3.2.
	vec2 gx = vec2( dFdx( dl ) * 0.014, dFdx( latD ) * 0.25 );
	vec2 gy = vec2( dFdy( dl ) * 0.014, dFdy( latD ) * 0.25 );
	float texels = max(
		length( vec2( gx.x * ${ATLAS_WIDTH}.0, gx.y * ${ATLAS_HEIGHT}.0 ) ),
		length( vec2( gy.x * ${ATLAS_WIDTH}.0, gy.y * ${ATLAS_HEIGHT}.0 ) ) );
	float sdfW = max( texels * ${(0.5 / ATLAS_SPREAD).toFixed(5)} * 0.5, 0.004 );

	// Orange peel: three octaves of value noise on the unit sphere.
	hzPeel = ( 0.5 * hzNoise( hp * 40.0 ) + 0.25 * hzNoise( hp * 80.0 ) + 0.125 * hzNoise( hp * 160.0 ) ) / 0.875;

	// Sky above the equator, earth below, split anti-aliased under the band.
	float sky = clamp( latD / aaLat + 0.5, 0.0, 1.0 );
	vec3 enamel = mix( uHzEarth, uHzSky, sky );

	// Horizon band: 1.5 degrees total.
	float ink = hzCov( abs( latD ), 0.75, aaLat );

	// Pitch ladder: nearest 5-degree step, 1..6 steps away from the horizon.
	float k = floor( latD / 5.0 + 0.5 );
	float ak = abs( k );
	if ( ak >= 1.0 && ak <= 6.0 ) {
		bool longMark = mod( ak, 2.0 ) < 0.5;
		float halfW = longMark ? 8.0 : 4.0;
		float halfH = longMark ? 0.4 : 0.3;
		float dLat = abs( latD - k * 5.0 );
		ink = max( ink, hzCov( dLat, halfH, aaLat ) * hzCov( abs( dl ), halfW, aaLon ) );
		if ( longMark ) {
			// Two digits, 5 degrees each, either side of the long mark,
			// reading left to right and upright in both hemispheres.
			float startX = dl > 0.0 ? 9.0 : -19.0;
			float t = ( dl - startX ) / 5.0;
			float cell = floor( t );
			float glyph = cell < 0.5 ? ak * 0.5 : 0.0;
			float lu = t - cell;
			float lv = ( latD - k * 5.0 ) / 3.2 + 0.5;
			vec2 uv = vec2( ( glyph + 0.15 + 0.7 * lu ) * 0.1, 0.10 + 0.80 * lv );
			float sd = textureGrad( uHzDigits, uv, gx, gy ).r;
			float rect = hzCov( abs( t - 1.0 ), 1.0, aaLon / 5.0 ) * hzCov( abs( lv - 0.5 ), 0.5, aaLat / 3.2 );
			ink = max( ink, smoothstep( 0.5 - sdfW, 0.5 + sdfW, sd ) * rect );
		}
	}
	diffuseColor.rgb = mix( enamel, uHzInk, ink );
}
`;

const FRAGMENT_ROUGHNESS = /* glsl */ `
#include <roughnessmap_fragment>
roughnessFactor = clamp( roughnessFactor + ( hzPeel - 0.5 ) * 0.1, 0.0, 1.0 );
`;

const FRAGMENT_CLEARCOAT = /* glsl */ `
#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
	material.clearcoatRoughness = clamp( material.clearcoatRoughness + ( hzPeel - 0.5 ) * 0.08, 0.0525, 1.0 );
#endif
`;

export type HorizonUniforms = {
  uHzDigits: IUniform<CanvasTexture>;
  uHzSky: IUniform<Color>;
  uHzEarth: IUniform<Color>;
  uHzInk: IUniform<Color>;
};

/**
 * The enamel: a MeshPhysicalMaterial whose albedo is painted analytically in
 * the fragment shader (see FRAGMENT_MAIN) while lighting, clearcoat and the
 * environment reflection stay three's own. The roughness carries a small
 * orange-peel modulation on both the base and the clearcoat layer.
 */
export function makeHorizonMaterial(atlas: CanvasTexture): {
  material: MeshPhysicalMaterial;
  uniforms: HorizonUniforms;
} {
  const uniforms: HorizonUniforms = {
    uHzDigits: { value: atlas },
    uHzSky: { value: new Color(HORIZON_SKY) },
    uHzEarth: { value: new Color(HORIZON_EARTH) },
    uHzInk: { value: new Color(HORIZON_INK) },
  };
  const material = new MeshPhysicalMaterial({
    color: HORIZON_SKY,
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
  });
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", VERTEX_PARS)
      .replace("#include <begin_vertex>", VERTEX_MAIN);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", FRAGMENT_PARS)
      .replace("#include <map_fragment>", FRAGMENT_MAIN)
      .replace("#include <roughnessmap_fragment>", FRAGMENT_ROUGHNESS)
      .replace("#include <lights_physical_fragment>", FRAGMENT_CLEARCOAT);
  };
  material.customProgramCacheKey = () => "horizon-enamel-v1";
  return { material, uniforms };
}
