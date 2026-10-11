import { LINES_UPRIGHT, PAGE_CROOKED, PAGE_UPRIGHT } from "./pixelpaper";

/** Tile k marks page k with k short lines; in the final state they are in order. */
const TILES = [1, 2, 3];
const SLOT = [235, 295, 355];

/**
 * Plate II: a crooked photo of a page is straightened, its text enhanced,
 * and three pages are put in order: each movement is a feature of the app.
 */
export default function PixelPaperFigure({ label }: { label: string }) {
  return (
    <svg className="fig fig--pixelpaper" viewBox="0 0 640 480" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <polygon className="fig__ghost" points={PAGE_CROOKED} />
      <polygon className="fig__page" points={PAGE_UPRIGHT} />
      {LINES_UPRIGHT.map(([x1, y1, x2, y2], i) => (
        <line className="fig__text" key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {TILES.map((k, i) => (
        <g className="fig__tile" data-tile={k} key={k}>
          <rect x={SLOT[i]} y="372" width="50" height="70" />
          {Array.from({ length: k }, (_, j) => (
            <line key={j} x1={SLOT[i] + 15} y1={392 + j * 10} x2={SLOT[i] + 35} y2={392 + j * 10} />
          ))}
        </g>
      ))}
    </svg>
  );
}
