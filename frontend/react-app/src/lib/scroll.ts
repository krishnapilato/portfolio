import Lenis from "lenis";
import { beatAt, type BeatRange } from "./beats";
import { useTimeline } from "./store";

let lenis: Lenis | null = null;

/** Scroll progress of the document, 0 at the top and 1 at the very end. */
export function readProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

/**
 * Starts smooth scrolling and mirrors progress (and the beat it falls in)
 * into the store. The document keeps its native scrollbar, keyboard
 * scrolling, find-in-page and anchors; Lenis only eases the wheel so the
 * camera never stutters between wheel ticks. Touch stays native, because
 * the camera has its own damping and fighting the platform's scroll
 * physics feels wrong. Returns a cleanup function.
 */
export function startScroll(reducedMotion: boolean, ranges: BeatRange[]): () => void {
  const set = useTimeline.getState().set;
  let last = window.scrollY;

  // Published synchronously from the scroll event: it is already one event
  // per frame, and a second hop through requestAnimationFrame only lets the
  // text fall a frame behind the picture on a busy main thread. The beat
  // is derived here, not in the renderer, so the readout and the keys work
  // before the scene has loaded and without WebGL at all.
  const publish = () => {
    const y = window.scrollY;
    const progress = readProgress();
    if (progress !== useTimeline.getState().progress) {
      set({ progress, velocity: y - last, beat: beatAt(ranges, progress) });
    }
    last = y;
  };

  let stopPump = () => {};
  if (!reducedMotion) {
    // No `anchors`: the page has one in-page link (skip to contact) and it
    // scrolls itself; Lenis's own anchor handler would aim at a heading
    // inside the fixed text layer and land in the wrong place.
    lenis = new Lenis({
      lerp: 0.13,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    lenis.on("scroll", publish);
    stopPump = startPump(lenis);
  }
  // Native scroll events cover keyboard, scrollbar drags, find-in-page and
  // reduced motion; with Lenis they simply agree with its own callback.
  window.addEventListener("scroll", publish, { passive: true });
  window.addEventListener("scrollend", publish, { passive: true });
  window.addEventListener("resize", publish, { passive: true });
  publish();

  return () => {
    window.removeEventListener("scroll", publish);
    window.removeEventListener("scrollend", publish);
    window.removeEventListener("resize", publish);
    stopPump();
    lenis?.destroy();
    lenis = null;
  };
}

/** Frames the loop keeps running after the last input or eased movement. */
const PUMP_TAIL = 24;
let wake: () => void = () => {};

/**
 * Lenis's animation frame, run only while there is something to ease: it
 * wakes on wheel and touch input and on a programmatic move, and stops a
 * few frames after the scroll has settled. An idle page must not wake the
 * main thread every vsync for the whole visit.
 */
function startPump(instance: Lenis): () => void {
  let frame = 0;
  let tail = 0;
  const tick = (time: number) => {
    frame = 0;
    instance.raf(time);
    if (instance.isScrolling === "smooth") tail = PUMP_TAIL;
    if (tail-- > 0) frame = requestAnimationFrame(tick);
  };
  wake = () => {
    tail = PUMP_TAIL;
    if (!frame) frame = requestAnimationFrame(tick);
  };
  instance.on("virtual-scroll", wake);
  wake();
  return () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    wake = () => {};
  };
}

/** Scrolls to a pixel offset, eased unless motion is reduced. */
export function scrollTo(top: number, immediate = false, duration = 1.2) {
  if (lenis && !immediate) {
    lenis.scrollTo(top, { duration, lock: false });
    wake();
    return;
  }
  window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
}

/** Halts a programmatic move where it is (Escape), without locking scrolling. */
export function stopScrollMove() {
  if (!lenis) return;
  lenis.stop();
  lenis.start();
}

export function stopScroll() { lenis?.stop(); }
export function resumeScroll() { lenis?.start(); }
