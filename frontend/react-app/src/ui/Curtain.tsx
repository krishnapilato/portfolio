import { useTimeline } from "../lib/store";

/**
 * What the visitor sees before the scene has compiled: a single horizon
 * line drawn in CSS exactly where the WebGL horizon will appear, so the
 * line becomes the line without moving. If WebGL is missing or the
 * context is lost, the line stays and the text film remains scrollable.
 */
export default function Curtain() {
  const ready = useTimeline((s) => s.ready);
  const webgl = useTimeline((s) => s.webgl);
  const lost = useTimeline((s) => s.contextLost);
  const beat = useTimeline((s) => s.beat);
  const show = !ready || !webgl || lost;
  return (
    <div className="curtain" data-show={show} data-fallback={!webgl || lost} data-first={beat === 0} aria-hidden="true">
      <span className="curtain__line" />
    </div>
  );
}
