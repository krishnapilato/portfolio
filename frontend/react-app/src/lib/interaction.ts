import { phasesOf, type BeatTiming } from "./beats";
import { COARSE_POINTER, REDUCED_MOTION } from "./media";
import { scrollTo, stopScrollMove } from "./scroll";
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

/** A beat as the navigation sees it: its id and its timing. */
export type FilmBeat = BeatTiming & { id: string };

// The film that stepping, deep links and the hash mirror navigate. It is
// registered once by startNavigation so the callers (keys, readout ticks,
// the skip link) only ever name a beat.
let film: FilmBeat[] = [];

/**
 * Keyboard stepping through the film. J/K, the vertical arrows and the
 * page keys go to the previous or next beat; Home and End go to the ends;
 * Escape stops a move in flight. Space and the horizontal arrows are left
 * to the browser, and text fields are never intercepted.
 */
export function startNavigation(beats: FilmBeat[]): () => void {
  film = beats;
  // The beat a key last asked for, while its move is still in flight, so
  // two quick presses step two beats the way a scrubber would.
  let pending = -1;
  const settle = () => {
    pending = -1;
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.isContentEditable) return;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

    if (event.key === "Escape") {
      stopScrollMove();
      settle();
      return;
    }
    const current = pending >= 0 ? pending : useTimeline.getState().beat;
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "PageDown":
      case "j":
      case "J":
        next = current + 1;
        break;
      case "ArrowUp":
      case "PageUp":
      case "k":
      case "K":
        next = current - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = film.length - 1;
        break;
      default:
        return;
    }
    if (next < 0 || next >= film.length) return;
    if (goToBeat(film[next].id)) {
      pending = next;
      event.preventDefault();
    }
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("scrollend", settle, { passive: true });
  return () => {
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scrollend", settle);
    film = [];
  };
}

/**
 * Moves keyboard focus to a beat's heading as soon as its block is
 * readable (a hidden block's heading cannot take focus), giving up quietly
 * if the scroll never arrives.
 */
export function focusBeatTitle(id: string) {
  const title = document.getElementById(`${id}-title`);
  const block = title?.closest<HTMLElement>(".beat__block");
  if (!title || !block) return;
  const attempt = () => {
    if (block.dataset.readable !== "true") return false;
    title.focus({ preventScroll: true });
    return true;
  };
  if (attempt()) return;
  const stop = useTimeline.subscribe(
    (s) => s.progress,
    () => {
      if (attempt()) stop();
    },
  );
  window.setTimeout(stop, 5000);
}

/** The spacer track that gives a beat its scroll range. */
export function trackOf(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-track="${id}"]`);
}

/**
 * The scroll position at which a beat is parked: the middle of its hold,
 * where the camera rests and the text is fully readable. A beat's range is
 * its whole track, except the last beat, whose range ends where the
 * document stops scrolling.
 */
export function holdPoint(element: HTMLElement, timing: BeatTiming = { weight: 1 }): number {
  const top = element.getBoundingClientRect().top + window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const span = Math.max(0, Math.min(element.offsetHeight, maxScroll - top));
  const phases = phasesOf(timing);
  return Math.round(top + span * (phases.arrive + phases.hold / 2));
}

/** Scrolls a beat into its parked position; false when the beat is unknown. */
export function goToBeat(id: string, immediate = useTimeline.getState().reducedMotion): boolean {
  const element = trackOf(id);
  if (!element) return false;
  const timing = film.find((b) => b.id === id);
  const target = holdPoint(element, timing);
  const beats = Math.abs(target - window.scrollY) / Math.max(window.innerHeight, 1);
  scrollTo(target, immediate, beats > 2 ? 2.4 : 1.2);
  return true;
}

/** On load, a #beat-id hash lands on that beat without animation. */
export function applyDeepLink(): boolean {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!id || !film.some((b) => b.id === id)) return false;
  return goToBeat(id, true);
}

/**
 * Mirrors the current beat into the URL with replaceState, so a reload or
 * a shared link lands where the visitor was and the back button never
 * becomes a ten-step trap. The first beat is the bare URL.
 */
export function startHashMirror(): () => void {
  const mirror = (beat: number) => {
    const id = film[beat]?.id;
    const wanted = beat > 0 && id ? `#${id}` : "";
    if (location.hash === wanted) return;
    history.replaceState(null, "", `${location.pathname}${location.search}${wanted}`);
  };
  mirror(useTimeline.getState().beat);
  return useTimeline.subscribe((s) => s.beat, mirror);
}
