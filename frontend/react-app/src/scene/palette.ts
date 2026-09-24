/** Scene colours, from the production palette. */
export const PALETTE = {
  background: "#0b0d10",
  surface: "#151a20",
  keyColor: "#ffdcb4",
  rimColor: "#cfdfff",
  postColor: "#ffb46b",
  fillSky: "#1c2431",
  accent: "#f2a23a",
  chalk: "#eef1f4",
};

/** Bezel post-light positions (case at rest), ±35° from top, just ahead of the bezel. */
export const POST_LIGHT_POSITIONS: [number, number, number][] = [
  [Math.sin((-35 * Math.PI) / 180) * 1.58, Math.cos((-35 * Math.PI) / 180) * 1.58, 1.22],
  [Math.sin((35 * Math.PI) / 180) * 1.58, Math.cos((35 * Math.PI) / 180) * 1.58, 1.22],
];

/**
 * Per-frame camera facts that the post stack needs (focus distance for the
 * depth of field). Written by the rig, read by the composer, never by React.
 */
export const cameraState = {
  focusDistance: 3,
  bokeh: 1.6,
  /** Diagnostics, mirrored each frame (read through window.__camera). */
  position: [0, 0, 0] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 32,
  time: 0,
};
