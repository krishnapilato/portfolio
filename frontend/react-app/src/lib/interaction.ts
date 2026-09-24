import { COARSE_POINTER, REDUCED_MOTION } from "./media";
import { scrollTo } from "./scroll";
import { useTimeline } from "./store";

/**
 * Mirrors the visitor's environment into the store: pointer position for
 * camera parallax, tab visibility so the loop can idle, and the motion
 * preference so every animated system reads one flag. Returns a cleanup.
 */
export function startEnvironmentSync(): () => void {
  const set = useTimeline.getState().set;
  const coarse = window.matchMedia(COARSE_POINTER);
  const reduced = window.matchMedia(REDUCED_MOTION);
  let frame = 0;
  let px = 0;
  let py = 0;

  const flush = () => {
    frame = 0;
    set({ pointerX: px, pointerY: py });
  };
  const onMove = (event: PointerEvent) => {
    // Touch never drives parallax: a thumb on the glass is not a gaze.
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    px = (event.clientX / window.innerWidth) * 2 - 1;
    py = -((event.clientY / window.innerHeight) * 2 - 1);
    if (!frame) frame = requestAnimationFrame(flush);
  };
  const onLeave = () => {
    px = 0;
    py = 0;
    if (!frame) frame = requestAnimationFrame(flush);
  };
  const onVisibility = () => set({ hidden: document.visibilityState !== "visible" });
  const onReduced = () => set({ reducedMotion: reduced.matches });

  set({ reducedMotion: reduced.matches, hidden: document.visibilityState !== "visible" });
  if (!coarse.matches) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
  }
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", onReduced);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    reduced.removeEventListener("change", onReduced);
    if (frame) cancelAnimationFrame(frame);
  };
}

/**
 * Keyboard stepping through the film. Arrow keys, page keys and space go to
 * the previous or next beat; Home and End go to the ends. The browser's
 * own scrolling for these keys is replaced only when a beat exists to go
 * to, so nothing is trapped and text fields are never intercepted.
 */
export function startKeyboardStepping(beatIds: string[]): () => void {
  const onKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.isContentEditable) return;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

    const current = useTimeline.getState().beat;
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "PageDown":
      case "ArrowRight":
      case " ":
        next = event.shiftKey && event.key === " " ? current - 1 : current + 1;
        break;
      case "ArrowUp":
      case "PageUp":
      case "ArrowLeft":
        next = current - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = beatIds.length - 1;
        break;
      default:
        return;
    }
    if (next < 0 || next >= beatIds.length) return;
    const element = document.getElementById(beatIds[next]);
    if (!element) return;
    event.preventDefault();
    goToBeat(element, beatIds[next]);
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}

/** Scrolls a beat into the parked position and mirrors it in the URL hash. */
export function goToBeat(element: HTMLElement, id: string) {
  const immediate = useTimeline.getState().reducedMotion;
  scrollTo(element, immediate);
  if (history.replaceState) history.replaceState(null, "", `#${id}`);
}

/** On load, a #beat-id hash lands on that beat without animation. */
export function applyDeepLink(beatIds: string[]) {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!id || !beatIds.includes(id)) return false;
  const element = document.getElementById(id);
  if (!element) return false;
  scrollTo(element, true);
  return true;
}
