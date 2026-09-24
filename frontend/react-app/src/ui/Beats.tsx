import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { Row } from "../content/beats";
import { computeRanges, localT, textAlpha, type BeatTiming } from "../lib/beats";
import { useTimeline } from "../lib/store";

export type BeatContent = BeatTiming & {
  id: string;
  kicker: string;
  title: string;
  titleLinks?: Record<string, string>;
  body: string | Row[];
  meta?: string;
  metaLink?: Record<string, string>;
  hint?: string;
  /** Extra content under the body: links, cards, a list. */
  children?: ReactNode;
  /** The object fills the frame in this beat; give the words a layer of air. */
  scrim?: boolean;
};

type Props = { beats: BeatContent[] };

/** A block is readable, and so in the tab order, above this opacity. */
const READABLE = 0.6;

/**
 * The film's words. The scroll length comes from one spacer track per beat
 * (its height is the beat's weight in viewports, and it is the anchor that
 * deep links and stepping scroll to). The text itself lives in a fixed
 * layer that never moves: each block's opacity follows its beat's own
 * progress, so words are fully readable during the hold and gone during
 * the move, and no two blocks are ever visible at once. A fixed layer, not
 * a sticky one, because a sticky stage is pushed away during the last
 * viewport of every section, which is exactly when the text must rest.
 * Every block stays in the accessibility tree and in find-in-page; only
 * the readable one takes pointer events and keyboard focus, so a screen
 * reader gets the whole article in film order and a keyboard never lands
 * on words that cannot be seen.
 */
export default function Beats({ beats }: Props) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = layer.current;
    if (!container) return;
    const ranges = computeRanges(beats);
    const blocks = beats.map((b) => {
      const section = container.querySelector<HTMLElement>(`[data-beat="${b.id}"]`);
      const block = section?.querySelector<HTMLElement>(".beat__block") ?? null;
      const focusable = block ? Array.from(block.querySelectorAll<HTMLElement>("a, button")) : [];
      return { section, block, focusable, readable: true, overflowing: false };
    });

    // A block scrolls inside itself, and is then a keyboard stop, only when
    // the viewport really is too short for it: measured, never assumed.
    const fit = () => {
      // Two layouts, not twenty: clear every flag, measure every block, then apply.
      for (const b of blocks) b.block?.classList.remove("beat__block--scroll");
      for (const b of blocks) {
        if (b.block) b.overflowing = b.block.scrollHeight > b.block.clientHeight + 1;
      }
      for (const b of blocks) {
        if (!b.block) continue;
        b.block.classList.toggle("beat__block--scroll", b.overflowing);
        b.block.tabIndex = b.overflowing && b.readable ? 0 : -1;
      }
    };

    const paint = (progress: number, reduced: boolean) => {
      for (let i = 0; i < blocks.length; i++) {
        const { section, block, focusable } = blocks[i];
        if (!section || !block) continue;
        const away = progress < ranges[i].start || progress > ranges[i].end;
        const eased = away ? 0 : textAlpha(beats, i, localT(ranges[i], progress));
        block.style.opacity = String(eased);
        // The scrim behind the words fades with them.
        section.style.setProperty("--alpha", eased.toFixed(3));
        block.style.setProperty("--rise", reduced ? "0px" : `${((1 - eased) * 12).toFixed(2)}px`);
        const readable = eased > READABLE;
        if (readable !== blocks[i].readable) {
          blocks[i].readable = readable;
          section.dataset.away = readable ? "false" : "true";
          block.dataset.readable = readable ? "true" : "false";
          block.tabIndex = readable && blocks[i].overflowing ? 0 : -1;
          for (const el of focusable) el.tabIndex = readable ? 0 : -1;
        }
      }
    };

    for (const b of blocks) b.readable = true;
    fit();
    paint(useTimeline.getState().progress, useTimeline.getState().reducedMotion);
    const unsubscribe = useTimeline.subscribe(
      (s) => s.progress,
      (progress) => paint(progress, useTimeline.getState().reducedMotion),
    );
    window.addEventListener("resize", fit);
    // Web fonts change every height; measure again when they land, and once
    // more when the film first moves, in case they landed in between.
    document.fonts?.ready.then(fit).catch(() => undefined);
    const refit = useTimeline.subscribe((s) => s.beat, fit);
    const late = window.setTimeout(fit, 2500);
    return () => {
      unsubscribe();
      refit();
      window.clearTimeout(late);
      window.removeEventListener("resize", fit);
    };
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
            {/* Scrolls inside itself only when a short viewport leaves no other way to reach every line. */}
            <div className="beat__block" data-lenis-prevent>
              {index === 0 ? (
                // The film's first kicker is the owner's name: the page's one h1.
                <h1 className="beat__kicker">
                  <span className="beat__index" aria-hidden="true">01</span>
                  {beat.kicker}
                </h1>
              ) : (
                <p className="beat__kicker">
                  <span className="beat__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  {beat.kicker}
                </p>
              )}
              <h2 className="beat__title" id={`${beat.id}-title`} tabIndex={-1}>
                <Linked text={beat.title} links={beat.titleLinks} className="beat__titlelink" />
              </h2>
              {Array.isArray(beat.body) ? (
                <dl className="beat__rows">
                  {beat.body.map((row) => (
                    <div className="beat__row" key={row.term}>
                      <dt>{row.term}</dt>
                      <dd>{row.detail}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="beat__body">{beat.body}</p>
              )}
              {beat.meta ? (
                <p className="beat__meta">
                  <Linked text={beat.meta} links={beat.metaLink} className="beat__metalink" />
                </p>
              ) : null}
              {beat.hint ? <p className="beat__meta beat__hint">{beat.hint}</p> : null}
              {beat.children}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

/** Text with some of its words turned into external links, in reading order. */
function Linked({ text, links, className }: { text: string; links?: Record<string, string>; className: string }) {
  if (!links) return text;
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  for (;;) {
    let first: { label: string; at: number } | null = null;
    for (const label of Object.keys(links)) {
      const at = rest.indexOf(label);
      if (at >= 0 && (!first || at < first.at)) first = { label, at };
    }
    if (!first) break;
    if (first.at > 0) parts.push(rest.slice(0, first.at));
    parts.push(
      <a className={className} href={links[first.label]} target="_blank" rel="noopener noreferrer" key={key++}>
        {first.label}
        <span className="links__glyph" aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>,
    );
    rest = rest.slice(first.at + first.label.length);
  }
  if (rest) parts.push(rest);
  return parts;
}
