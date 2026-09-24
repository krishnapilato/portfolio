import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { computeRanges, localT } from "../lib/beats";
import { useTimeline } from "../lib/store";

export type BeatAlign = "left" | "right" | "center";
export type BeatValign = "top" | "middle" | "bottom";

export type BeatContent = {
  id: string;
  weight: number;
  kicker: string;
  title: string;
  body: string;
  meta?: string;
  /** Where the text block sits on wide screens; phones put every beat in the lower third. */
  align?: BeatAlign;
  valign?: BeatValign;
  /** Extra content under the body: links, cards, a list. */
  children?: ReactNode;
  /** Fraction of the range during which the block fades in and out. */
  fade?: number;
};

type Props = { beats: BeatContent[] };

/**
 * One tall section per beat. Inside, a sticky stage keeps the text in view
 * while the camera travels; the text's opacity follows the beat's own
 * progress so it is fully readable during the hold and gone during the
 * move. Every beat is a real anchor (`#id`), so deep links and keyboard
 * stepping need no extra machinery.
 */
export default function Beats({ beats }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const ranges = computeRanges(beats);
    const blocks = beats.map((b) => container.querySelector<HTMLElement>(`[data-beat="${b.id}"] .beat__block`));
    const fades = beats.map((b) => b.fade ?? 0.18);
    const last = beats.length - 1;

    const paint = (progress: number, reduced: boolean) => {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!block) continue;
        const t = localT(ranges[i], progress);
        const fade = fades[i];
        let a = 1;
        if (i > 0 && t < fade) a = t / fade;
        if (i < last && t > 1 - fade) a = Math.min(a, (1 - t) / fade);
        const eased = a * a * (3 - 2 * a);
        const away = progress < ranges[i].start || progress > ranges[i].end;
        block.style.opacity = away ? "0" : String(eased);
        block.style.setProperty("--rise", reduced ? "0px" : `${((1 - eased) * 14).toFixed(2)}px`);
        block.style.visibility = away || eased <= 0.001 ? "hidden" : "visible";
      }
    };

    paint(useTimeline.getState().progress, useTimeline.getState().reducedMotion);
    return useTimeline.subscribe(
      (s) => s.progress,
      (progress) => paint(progress, useTimeline.getState().reducedMotion),
    );
  }, [beats]);

  return (
    <div className="beats" ref={root}>
      {beats.map((beat, index) => (
        <section
          className="beat"
          id={beat.id}
          key={beat.id}
          data-beat={beat.id}
          data-align={beat.align ?? "left"}
          data-valign={beat.valign ?? "middle"}
          aria-labelledby={`${beat.id}-title`}
          style={{ "--weight": beat.weight } as CSSProperties}
        >
          <div className="beat__stage">
            <div className="beat__block">
              <p className="beat__kicker">
                <span className="beat__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {beat.kicker}
              </p>
              <h2 className="beat__title" id={`${beat.id}-title`}>{beat.title}</h2>
              <p className="beat__body">{beat.body}</p>
              {beat.meta ? <p className="beat__meta">{beat.meta}</p> : null}
              {beat.children}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
