import type { Ctx2D } from "../../textures/canvas";
import { drawScale } from "../../textures/engrave";

/**
 * Bank scale for the bezel's front annulus, drawn in the face's disc UV
 * (canvas centre = ring centre, canvas half-size = `uvRadius` scene units).
 * Majors at 0, 10, 20, 30, 60, 90 degrees each side of top, minors every 5
 * between 0 and 30, numerals on the majors, a filled index at zero. Why
 * only these marks: it is the real layout of a bank scale, and a busier
 * ring would read as a compass, not an attitude indicator.
 */
export function drawBankScale(ctx: Ctx2D, size: number, uvRadius: number) {
  const px = (units: number) => (units / (2 * uvRadius)) * size;
  const radius = px(1.632);
  const width = Math.max(1.5, px(0.009));
  const tick = px(0.036);
  const majorTick = px(0.06);
  const font = `600 ${Math.round(px(0.046))}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  const label = (value: number) => (value === 0 ? null : String(Math.abs(value)));
  const shared = { radius, tick, majorTick, width, font, label, labelOffset: px(0.02) };
  drawScale(ctx, size, { ...shared, from: -30, to: 30, step: 5, major: 10 });
  drawScale(ctx, size, { ...shared, from: -90, to: -60, step: 30, major: 30 });
  drawScale(ctx, size, { ...shared, from: 60, to: 90, step: 30, major: 30 });

  // Zero index: a filled triangle hanging from the outer edge.
  const cx = size / 2;
  const cy = size / 2;
  const half = px(0.03);
  const top = cy - radius - px(0.004);
  const apex = cy - radius + px(0.062);
  ctx.beginPath();
  ctx.moveTo(cx - half, top);
  ctx.lineTo(cx + half, top);
  ctx.lineTo(cx, apex);
  ctx.closePath();
  ctx.fill();
}
