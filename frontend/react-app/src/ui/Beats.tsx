import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { computeRanges, localT, textAlpha, type BeatTiming } from "../lib/beats";
import { useTimeline } from "../lib/store";

export type BeatContent = BeatTiming & {
  id: string;
  kicker: string;
  title: string;
  body: string;
  meta?: string;
  /** Extra content under the body: links, cards, a list. */
  children?: ReactNode;
  /** The object fills the frame in this beat; give the words a layer of air. */
  scrim?: boolean;
};

type Props = { beats: BeatContent[] };

/**
 * The film's words. The scroll length comes from one spacer track per beat
 * (its height is the beat's weight in viewports, and it is the anchor that
 * deep links and stepping scroll to). The text itself lives in a fixed
 * layer that never moves: each block's opacity follows its beat's own
 * progress, so words are fully readable during the hold and gone during
 * the move, and no two blocks are ever visible at once. A fixed layer, not
 * a sticky one, because a sticky stage is pushed away during the last
 * viewport of every section, which is exactly when the text must rest.
 * Reading order is preserved: the blocks sit in the DOM in film order.
 */
export default function Beats({ beats }: Props) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = layer.current;
    if (!container) return;
    const ranges = computeRanges(beats);
    const blocks = beats.map((b) => container.querySelector<HTMLElement>(`[data-beat="${b.id}"]`));

    const paint = (progress: number, reduced: boolean) => {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!block) continue;
        const away = progress < ranges[i].start || progress > ranges[i].end;
        const eased = away ? 0 : textAlpha(beats, i, localT(ranges[i], progress));
        const visible = eased > 0.001;
        block.style.opacity = String(eased);
        block.style.setProperty("--rise", reduced ? "0px" : `${((1 - eased) * 12).toFixed(2)}px`);
        block.style.visibility = visible ? "visible" : "hidden";
        // Only the readable block takes focus and clicks; the rest stay in
        // the accessibility tree but out of the tab order.
        block.inert = !visible;
      }
    };

    paint(useTimeline.getState().progress, useTimeline.getState().reducedMotion);
    return useTimeline.subscribe(
      (s) => s.progress,
      (progress) => paint(progress, useTimeline.getState().reducedMotion),
    );
  }, [beats]);

  return (
    <>
      <div className="tracks" aria-hidden="true">
        {beats.map((beat) => (
          <div className="track" key={beat.id} data-track={beat.id} style={{ "--weight": beat.weight } as CSSProperties} />
        ))}
      </div>
      <div className="beats" ref={layer}>
        {beats.map((beat, index) => (
          <section
            className="beat"
            id={beat.id}
            key={beat.id}
            data-beat={beat.id}
            data-scrim={beat.scrim ? "true" : undefined}
            aria-labelledby={`${beat.id}-title`}
          >
            <div className="beat__block">
              <p className="beat__kicker">
                <span className="beat__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {beat.kicker}
              </p>
              <h2 className="beat__title" id={`${beat.id}-title`} tabIndex={-1}>{beat.title}</h2>
              <p className="beat__body">{beat.body}</p>
              {beat.meta ? <p className="beat__meta">{beat.meta}</p> : null}
              {beat.children}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
