import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Copy, Lang } from "../i18n";
import { COPY, persistLang, resolveInitialLang } from "../i18n";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/** A self-contained 1s tick, kept local to the components that display time. */
export function useTick(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Language state, mirrored into <html lang>, the title and the meta description. */
export function useLanguage() {
  const [lang, setLang] = useState<Lang>(resolveInitialLang);
  const copy: Copy = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = copy.documentTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", copy.metaDescription);
    persistLang(lang);
  }, [lang, copy]);

  const toggle = useCallback(
    () => setLang((current) => (current === "en" ? "it" : "en")),
    [],
  );

  return { lang, copy, setLang, toggle };
}

/**
 * One light source for the whole page.
 *
 * The pointer position is written to CSS custom properties — `--gx/--gy` in
 * viewport space on <html>, plus element-local `--lx/--ly` on every
 * `[data-light]` surface. Because each glass panel reads the same world-space
 * light, highlights line up across panels as if a single lamp were moving
 * over the page. Nothing here touches React state, so pointer movement never
 * triggers a render.
 */
export function useGlobalLight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    const root = document.documentElement;
    let surfaces = Array.from(
      document.querySelectorAll<HTMLElement>("[data-light]"),
    );
    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.3;

    const paint = () => {
      frame = 0;
      root.style.setProperty("--gx", `${x}px`);
      root.style.setProperty("--gy", `${y}px`);
      for (const surface of surfaces) {
        const rect = surface.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
        surface.style.setProperty("--lx", `${x - rect.left}px`);
        surface.style.setProperty("--ly", `${y - rect.top}px`);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      schedule();
    };

    const refresh = () => {
      surfaces = Array.from(
        document.querySelectorAll<HTMLElement>("[data-light]"),
      );
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    schedule();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", refresh);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

/**
 * Reveals `[data-reveal]` elements once, then stops observing them.
 * Discrete reveals via IntersectionObserver cost nothing after they fire —
 * the continuous scroll effects are left to CSS scroll-driven animations.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!targets.length) return;

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      for (const target of targets) target.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type Telemetry = {
  fps: number | null;
  history: number[];
  load: number | null;
  paint: number | null;
  viewport: string;
  timeZone: string;
  reducedMotion: boolean;
};

export const TELEMETRY_HISTORY = 44;

/**
 * Real numbers read out of the visitor's own browser — navigation timing,
 * paint timing, live frame rate. The frame sampler only runs while the panel
 * is on screen and the tab is visible, so it never burns cycles in the
 * background.
 */
export function useTelemetry(ref: RefObject<HTMLElement | null>): Telemetry {
  const [fps, setFps] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [timing, setTiming] = useState<{
    load: number | null;
    paint: number | null;
  }>({
    load: null,
    paint: null,
  });
  const [viewport, setViewport] = useState(
    () => `${window.innerWidth} × ${window.innerHeight}`,
  );
  const [active, setActive] = useState(false);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const reducedMotion = typeof window !== "undefined" && prefersReducedMotion();

  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const fcp = performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "first-contentful-paint");
      setTiming({
        load:
          nav && nav.loadEventEnd > 0
            ? Math.round(nav.loadEventEnd - nav.startTime)
            : null,
        paint: fcp ? Math.round(fcp.startTime) : null,
      });
    };
    read();
    window.addEventListener("load", read, { once: true });
    return () => window.removeEventListener("load", read);
  }, []);

  useEffect(() => {
    const onResize = () =>
      setViewport(`${window.innerWidth} × ${window.innerHeight}`);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setActive(
          entry.isIntersecting && document.visibilityState === "visible",
        ),
      { threshold: 0.2 },
    );
    observer.observe(element);
    const onVisibility = () => {
      if (document.visibilityState !== "visible") setActive(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);

  useEffect(() => {
    if (!active) return;
    let frames = 0;
    let start = performance.now();
    let raf = 0;

    const loop = (time: number) => {
      frames += 1;
      const elapsed = time - start;
      if (elapsed >= 1000) {
        const value = Math.round((frames * 1000) / elapsed);
        setFps(value);
        setHistory((previous) =>
          [...previous, value].slice(-TELEMETRY_HISTORY),
        );
        frames = 0;
        start = time;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return {
    fps,
    history,
    load: timing.load,
    paint: timing.paint,
    viewport,
    timeZone,
    reducedMotion,
  };
}

/** Single-key shortcut, ignored while a field is focused or a modifier is held. */
export function useHotkey(key: string, handler: () => void) {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key.toLowerCase() !== key) return;
      event.preventDefault();
      saved.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key]);
}
