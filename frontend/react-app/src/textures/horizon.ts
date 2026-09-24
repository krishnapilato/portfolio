import { Color, MeshPhysicalMaterial, type IUniform, type Texture, type WebGLProgramParametersWithUniforms } from "three";
import { ATLAS_HEIGHT, ATLAS_SPREAD, ATLAS_WIDTH } from "./digits";

/** Palette of the horizon sphere (sRGB hex; `Color` converts to linear). */
export const HORIZON_SKY = "#2E4A66";
export const HORIZON_EARTH = "#7A4E2B";
export const HORIZON_INK = "#EEF1F4";

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
  uHzDigits: IUniform<Texture>;
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
export function makeHorizonMaterial(atlas: Texture): {
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
