import { makeSurface, type Ctx2D, type Surface } from "./canvas";

/**
 * The numeral atlas for the pitch ladder: "0123456789" in a bold system
 * sans, white on black, converted to a signed distance field. Why a
 * distance field and not the plain bitmap: the film's macro beats magnify
 * a digit five to six times, where a 52 px bitmap would blur; a distance
 * field thresholded with fwidth stays crisp at any magnification and still
 * mipmaps cleanly at the wide shot.
 */

/** Digit atlas layout: ten cells of 51.2 x 64 texels, one glyph each. */
export const ATLAS_WIDTH = 512;
export const ATLAS_HEIGHT = 64;
/** Distance-field spread in atlas texels: 0.5 in the texture equals this many texels. */
export const ATLAS_SPREAD = 8;
/** The atlas is rasterised at this multiple and distance-transformed before downsampling. */
const OVERSAMPLE = 2;
const FONT = '700 52px "Helvetica Neue", Arial, "Liberation Sans", sans-serif';

/**
 * Builds the numeral atlas for the pitch ladder: "0123456789" in a bold
 * system sans, white on black, then converted to a signed distance field.
 * Why a distance field and not the plain bitmap: the film's macro beats
 * magnify a digit five to six times, where a 52 px bitmap would blur; a
 * distance field thresholded with fwidth stays crisp at any magnification
 * and still mipmaps cleanly at the wide shot.
 */
export function makeDigitField(): Surface {
  // Oversampled rasterisation for a sub-texel-accurate outline.
  const bigW = ATLAS_WIDTH * OVERSAMPLE;
  const bigH = ATLAS_HEIGHT * OVERSAMPLE;
  const [, bctx] = makeSurface(bigW, bigH);
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
  const [field, fctx] = makeSurface(ATLAS_WIDTH, ATLAS_HEIGHT);
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
  return field;
}

function drawDigits(ctx: Ctx2D, scale: number) {
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

