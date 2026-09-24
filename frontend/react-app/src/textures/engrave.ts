import { ctxOf, makeCanvas, type Ctx2D, type Surface } from "./canvas";

export type EngraveSet = {
  /** Greyscale: white = raised metal, black = groove floor. */
  height: Surface;
  /** Alpha mask of the engraved marks, for tinting the paint fill. */
  mask: Surface;
};

export type Engraver = (ctx: Ctx2D, size: number) => void;

/**
 * Engraved marks (scales, ticks, lettering) as a height map plus a mask.
 * The caller draws whatever the plate says with plain canvas calls; this
 * turns the drawing into a height field with a crisp machined lip (the
 * caller derives the normal map, usually merged with the metal's own) and
 * a mask that the material uses to fill the grooves with paint.
 */
export function makeEngraving(size: number, draw: Engraver): EngraveSet {
  const [mask, mctx] = makeCanvas(size, "#000");
  mctx.fillStyle = "#fff";
  mctx.strokeStyle = "#fff";
  draw(mctx, size);

  // The groove floor is the inverted mask; four half-texel offset passes
  // soften the lip slightly (canvas `filter` is avoided: Safari lacks it).
  const [height, hctx] = makeCanvas(size, "#ffffff");
  const inverted = invert(mask);
  hctx.globalCompositeOperation = "multiply";
  hctx.drawImage(inverted, 0, 0);
  hctx.globalAlpha = 0.35;
  for (const [dx, dy] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) {
    hctx.drawImage(inverted, dx, dy);
  }
  hctx.globalAlpha = 1;
  hctx.globalCompositeOperation = "source-over";

  return { height, mask };
}

function invert(source: Surface): Surface {
  const [canvas, ctx] = makeCanvas(source.width, "#fff");
  ctx.globalCompositeOperation = "difference";
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

/** Draws a ring of tick marks; long ticks every `major`, labels every `label`. */
export function drawScale(
  ctx: Ctx2D,
  size: number,
  options: {
    radius: number;
    from: number;
    to: number;
    step: number;
    major: number;
    tick: number;
    majorTick: number;
    width: number;
    font?: string;
    label?: (value: number) => string | null;
    labelOffset?: number;
    degreesPerUnit?: number;
    startAngle?: number;
  },
) {
  const {
    radius, from, to, step, major, tick, majorTick, width, font,
    label, labelOffset = 0, degreesPerUnit = 1, startAngle = -90,
  } = options;
  const cx = size / 2;
  const cy = size / 2;
  ctx.lineCap = "butt";
  if (font) {
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }
  for (let value = from; value <= to + 1e-9; value += step) {
    const isMajor = Math.abs(value / major - Math.round(value / major)) < 1e-6;
    const angle = ((startAngle + value * degreesPerUnit) * Math.PI) / 180;
    const len = isMajor ? majorTick : tick;
    ctx.lineWidth = isMajor ? width * 1.6 : width;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.lineTo(cx + Math.cos(angle) * (radius - len), cy + Math.sin(angle) * (radius - len));
    ctx.stroke();
    if (isMajor && label && font) {
      const text = label(value);
      if (text) {
        const r = radius - len - labelOffset;
        ctx.fillText(text, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }
    }
  }
}

/**
 * Fills engraved grooves with paint: the mask is stamped onto an albedo
 * canvas in `color`, and onto a roughness canvas as matte paint, so the
 * lettering reads as enamel in a machined groove rather than as a decal.
 */
export function stampInk(
  target: { albedo: Surface; rough: Surface },
  mask: Surface,
  color = "#0c0d10",
  paintRoughness = 0.7,
) {
  const size = mask.width;
  const [tinted, tctx] = makeCanvas(size, color);
  tctx.globalCompositeOperation = "destination-in";
  tctx.drawImage(mask, 0, 0);
  tctx.globalCompositeOperation = "source-over";
  ctxOf(target.albedo).drawImage(tinted, 0, 0, target.albedo.width, target.albedo.height);

  const level = Math.round(paintRoughness * 255);
  const [matte, mctx] = makeCanvas(size, `rgb(${level},${level},${level})`);
  mctx.globalCompositeOperation = "destination-in";
  mctx.drawImage(mask, 0, 0);
  mctx.globalCompositeOperation = "source-over";
  ctxOf(target.rough).drawImage(matte, 0, 0, target.rough.width, target.rough.height);
}
