const TEXT_Y = [104, 128, 152, 176, 200];
const VERSO_ENDS = [288, 272, 288, 248, 200];

/** Plate III: this book, drawn small: text above a rule, notes below it. */
export default function SiteFigure({ label }: { label: string }) {
  return (
    <svg className="fig fig--site" viewBox="0 0 640 480" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <rect className="fig__ink2 fig__outline" x="72" y="56" width="240" height="368" />
      <rect className="fig__ink2 fig__outline" x="328" y="56" width="240" height="368" />
      <path className="fig__rule2 fig__outline" d="M320 48 V432" />
      {[0, 256].map((dx) =>
        TEXT_Y.map((y, i) => <path className="fig__ink fig__line" key={`${dx}-${y}`} d={`M${96 + dx} ${y} H${VERSO_ENDS[i] + dx}`} />),
      )}
      {[0, 256].map((dx) =>
        [
          [336, 240],
          [352, 208],
        ].map(([y, end]) => <path className="fig__ink2 fig__noteline" key={`${dx}-${y}`} d={`M${96 + dx} ${y} H${end + dx}`} />),
      )}
      <path className="fig__pencil fig__printed" d="M96 312 H480" />
      <path className="fig__wash" d="M480 312 H640" />
    </svg>
  );
}
