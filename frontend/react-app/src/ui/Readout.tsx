import { useEffect, useRef, useState, useTransition, ViewTransition } from "react";
import { computeRanges } from "../lib/beats";
import { goToBeat } from "../lib/interaction";
import { useTimeline } from "../lib/store";
import { attitudeAt, beatTimeAt, type Attitude } from "../scene/attitude";
import { KEYFRAMES } from "../scene/keyframes";

type Props = { labels: { id: string; label: string; tickLabel: string }[] };

const RANGES = computeRanges(KEYFRAMES);
const attitude: Attitude = { pitch: 0, roll: 0, yaw: 0 };

const formatPitch = (v: number) => {
  const r = Math.round(v);
  return r === 0 ? "0" : r > 0 ? `+${r}` : `−${Math.abs(r)}`;
};
const formatBank = (v: number) => {
  const r = Math.round(Math.abs(v));
  return r === 0 ? "0" : `${v < 0 ? "L" : "R"}${r}`;
};

/**
 * The only orientation on the page, read like an instrument: the beat's
 * name, a tick tape with a pointer that slides continuously with scroll
 * (the bank pointer sweeping its scale), and the live attitude in degrees.
 * Until the scene has drawn its first frame a striped OFF flag covers the
 * tape, the way a real gyro flags itself before the rotor is up to speed.
 */
export default function Readout({ labels }: Props) {
  const beat = useTimeline((s) => s.beat);
  const ready = useTimeline((s) => s.ready);
  const webgl = useTimeline((s) => s.webgl);
  const [shown, setShown] = useState(beat);
  const [, startTransition] = useTransition();
  const pointer = useRef<HTMLSpanElement>(null);
  const pitch = useRef<HTMLSpanElement>(null);
  const bank = useRef<HTMLSpanElement>(null);

  // The name cross-fades through a view transition; everything numeric is
  // written straight to the DOM from the store so it never re-renders.
  useEffect(() => {
    startTransition(() => setShown(beat));
  }, [beat, startTransition]);

  useEffect(() => {
    const paint = (progress: number) => {
      if (pointer.current) pointer.current.style.setProperty("--p", progress.toFixed(4));
      attitudeAt(beatTimeAt(progress, RANGES), attitude);
      const p = formatPitch(attitude.pitch);
      const b = formatBank(attitude.roll);
      if (pitch.current && pitch.current.textContent !== p) pitch.current.textContent = p;
      if (bank.current && bank.current.textContent !== b) bank.current.textContent = b;
    };
    paint(useTimeline.getState().progress);
    return useTimeline.subscribe((s) => s.progress, paint);
  }, []);

  const current = labels[shown] ?? labels[0];

  return (
    <div className="readout" role="group" aria-label="Position in the story">
      <ViewTransition default="readout-name">
        <span className="readout__name" key={current.id}>{current.label}</span>
      </ViewTransition>

      <div className="tape" data-off={!ready || !webgl}>
        <span className="tape__pointer" ref={pointer} aria-hidden="true" />
        {labels.map((item, index) => (
          <button
            className="tape__tick"
            type="button"
            key={item.id}
            aria-label={item.tickLabel}
            aria-current={index === beat ? "step" : undefined}
            data-label={item.label}
            onClick={() => {
              const element = document.getElementById(item.id);
              if (element) goToBeat(element, item.id);
            }}
          />
        ))}
        <span className="tape__flag" aria-hidden="true">OFF</span>
      </div>

      <span className="readout__attitude" aria-live="off">
        <span className="readout__label">Pitch</span> <span className="readout__value" ref={pitch}>0</span>
        <span className="readout__label">Bank</span> <span className="readout__value" ref={bank}>0</span>
      </span>
    </div>
  );
}
