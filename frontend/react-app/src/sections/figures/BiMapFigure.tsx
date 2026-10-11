/** Municipality rows per province: y positions and line ends. */
const PROVINCES = [
  { stem: 98, top: 62, bottom: 134, rows: [[70, 496], [84, 432], [98, 520], [112, 404], [126, 464]] },
  { stem: 194, top: 158, bottom: 230, rows: [[166, 380], [185, 496], [203, 432], [222, 520]] },
  { stem: 290, top: 254, bottom: 326, rows: [[262, 404], [273, 464], [284, 380], [296, 496], [307, 432], [318, 520]] },
  { stem: 384, top: 350, bottom: 418, rows: [[358, 404], [384, 464], [410, 380]] },
];

/**
 * Plate I: one region opened into its provinces, each opened into its
 * municipalities: what the dashboard does, one level at a time. Final
 * state in the markup; the scroll draws it.
 */
export default function BiMapFigure({ label }: { label: string }) {
  return (
    <svg className="fig fig--bimap" viewBox="0 0 640 480" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <path className="fig__ink fig__region" d="M120 56 H104 V424 H120" />
      {PROVINCES.map((p) => (
        <g key={p.stem}>
          <path className="fig__ink fig__stem" d={`M104 ${p.stem} H244`} />
          <path className="fig__ink fig__bracket" d={`M264 ${p.top} H244 V${p.bottom} H264`} />
          {p.rows.map(([y, x2]) => (
            <g key={y}>
              <path className="fig__ink2 fig__muni" d={`M284 ${y} H${x2}`} />
              <circle className="fig__dot" cx="276" cy={y} r="3" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
