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

  // Published synchronously from the scroll event: it is already one event
  // per frame, and a second hop through requestAnimationFrame only lets the
  // text fall a frame behind the picture on a busy main thread.
  const publish = () => {
    const y = window.scrollY;
    const progress = readProgress();
    if (progress !== useTimeline.getState().progress) set({ progress, velocity: y - last });
    last = y;
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
    lenis.on("scroll", publish);
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
