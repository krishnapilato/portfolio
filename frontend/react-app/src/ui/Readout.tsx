import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
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
  const pointer = useRef<HTMLSpanElement>(null);
  const pitch = useRef<HTMLSpanElement>(null);
  const bank = useRef<HTMLSpanElement>(null);
  const tape = useRef<HTMLDivElement>(null);
  // The tape is one control, not ten: a hand or a mouse reads the tick
  // under it and a release goes there; keys step it like any slider.
  // Ten 14 px ticks are no target for a thumb, and a ring around each
  // would ring three.
  const [preview, setPreview] = useState(-1);
  const scrub = useRef({ id: -1, index: -1 });

  const nearestTick = (clientX: number) => {
    const ticks = tape.current?.querySelectorAll<HTMLElement>(".tape__tick");
    if (!ticks || ticks.length === 0) return -1;
    let best = 0;
    let bestDistance = Infinity;
    ticks.forEach((tick, index) => {
      const rect = tick.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - clientX);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  };
  const onTapePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    tape.current?.setPointerCapture(event.pointerId);
    const index = nearestTick(event.clientX);
    scrub.current = { id: event.pointerId, index };
    setPreview(index);
  };
  const onTapePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const index = nearestTick(event.clientX);
    if (scrub.current.id === event.pointerId) {
      if (index !== scrub.current.index) {
        scrub.current.index = index;
        setPreview(index);
      }
      return;
    }
    // A hovering mouse reads the tick under it.
    if (event.pointerType === "mouse" && index !== preview) setPreview(index);
  };
  const onTapePointerUp = (event: ReactPointerEvent<HTMLDivElement>, go: boolean) => {
    if (scrub.current.id !== event.pointerId) return;
    const index = scrub.current.index;
    scrub.current = { id: -1, index: -1 };
    setPreview(event.pointerType === "mouse" ? index : -1);
    if (go && index >= 0) goToBeat(labels[index].id);
  };
  const onTapeLeave = () => {
    if (scrub.current.id === -1) setPreview(-1);
  };
  const onTapeKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = beat + 1;
        break;
      case "ArrowLeft":
        next = beat - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = labels.length - 1;
        break;
      default:
        return;
    }
    // Handled here, so the film's own key stepping does not step twice.
    event.preventDefault();
    event.stopPropagation();
    if (next >= 0 && next < labels.length) goToBeat(labels[next].id);
  };

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

  const shown = preview >= 0 ? preview : beat;
  const current = labels[shown] ?? labels[0];

  return (
    <nav className="readout" aria-label="Film position" data-scrubbing={preview >= 0}>
      <span className="readout__name">{current.label}</span>
      <span className="readout__index" aria-hidden="true">
        {String(shown + 1).padStart(2, "0")}<span className="readout__of">/{labels.length}</span>
      </span>

      <div
        className="tape"
        ref={tape}
        role="slider"
        tabIndex={0}
        aria-label="Beat"
        aria-valuemin={1}
        aria-valuemax={labels.length}
        aria-valuenow={beat + 1}
        aria-valuetext={labels[beat]?.tickLabel}
        aria-orientation="horizontal"
        data-off={!ready || !webgl}
        onPointerDown={onTapePointerDown}
        onPointerMove={onTapePointerMove}
        onPointerUp={(event) => onTapePointerUp(event, true)}
        onPointerCancel={(event) => onTapePointerUp(event, false)}
        onPointerLeave={onTapeLeave}
        onKeyDown={onTapeKey}
      >
        <span className="tape__pointer" ref={pointer} aria-hidden="true" />
        {labels.map((item, index) => (
          <span className="tape__tick" key={item.id} data-current={index === beat ? "true" : undefined} aria-hidden="true" />
        ))}
        <span className="tape__flag" aria-hidden="true">OFF</span>
      </div>

      <span className="readout__attitude" aria-hidden="true">
        <span className="readout__label"><span className="readout__long">Pitch</span><span className="readout__short">P</span></span>{" "}
        <span className="readout__value" ref={pitch}>0</span>
        <span className="readout__label"><span className="readout__long">Bank</span><span className="readout__short">B</span></span>{" "}
        <span className="readout__value" ref={bank}>0</span>
      </span>
    </nav>
  );
}
