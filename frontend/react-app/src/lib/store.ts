import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

/** Rendering tier, decided once at start-up from the device (see device.ts). */
export type Tier = "high" | "mid" | "low";

export type TimelineState = {
  /** Raw scroll progress through the film, 0 at the top and 1 at the end. */
  progress: number;
  /** Scroll velocity in px/frame, used to soften the camera on fast flicks. */
  velocity: number;
  /** Index of the beat the visitor is currently reading. */
  beat: number;
  /** The scene has compiled its shaders and drawn its first frame. */
  ready: boolean;
  tier: Tier;
  /**
   * Effects level, starting equal to the tier and only ever stepping down:
   * the frame-time governor drops the post stack, the reflective bench and
   * the transmissive glass on a device that cannot hold its frame rate.
   * Textures and geometry stay at the tier, so a demotion never rebuilds them.
   */
  quality: Tier;
  reducedMotion: boolean;
  /** Pointer in normalised device coordinates (-1..1), parked at 0 on touch. */
  pointerX: number;
  pointerY: number;
  /** The document is hidden (tab in background). */
  hidden: boolean;
  /** WebGL 2 is available; when false the DOM-only fallback is shown. */
  webgl: boolean;
  /** WebGL context was lost and could not be restored. */
  contextLost: boolean;
  set: (partial: Partial<TimelineState>) => void;
};

/**
 * One store for the whole film. Per-frame readers (the camera rig, the
 * instrument) call `useTimeline.getState()` inside useFrame so scrolling
 * never triggers a React render; the DOM overlay subscribes only to the
 * coarse `beat` index, which changes a handful of times per visit.
 */
export const useTimeline = create<TimelineState>()(
  subscribeWithSelector((set) => ({
    progress: 0,
    velocity: 0,
    beat: 0,
    ready: false,
    tier: "mid",
    quality: "mid",
    reducedMotion: false,
    pointerX: 0,
    pointerY: 0,
    hidden: false,
    webgl: true,
    contextLost: false,
    set: (partial) => set(partial),
  })),
);
