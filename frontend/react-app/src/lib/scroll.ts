import Lenis from "lenis";
import { useTimeline } from "./store";

let lenis: Lenis | null = null;

/** Scroll progress of the document, 0 at the top and 1 at the very end. */
export function readProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

/**
 * Starts smooth scrolling and mirrors progress into the store.
 * The document keeps its native scrollbar, keyboard scrolling, find-in-page
 * and anchors; Lenis only eases the wheel so the camera never stutters
 * between wheel ticks. Touch stays native, because the camera has its own
 * damping and fighting the platform's scroll physics feels wrong.
 * Returns a cleanup function.
 */
export function startScroll(reducedMotion: boolean): () => void {
  const set = useTimeline.getState().set;
  let last = window.scrollY;
  let frame = 0;

  const publish = () => {
    frame = 0;
    const y = window.scrollY;
    set({ progress: readProgress(), velocity: y - last });
    last = y;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(publish);
  };

  if (!reducedMotion) {
    lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      anchors: true,
    });
    lenis.on("scroll", schedule);
  } else {
    window.addEventListener("scroll", schedule, { passive: true });
  }
  window.addEventListener("resize", schedule, { passive: true });
  publish();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

/** Scrolls to a pixel offset, eased unless motion is reduced. */
export function scrollTo(top: number, immediate = false, duration = 1.2) {
  if (lenis && !immediate) {
    lenis.scrollTo(top, { duration, lock: false });
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
