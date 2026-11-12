import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

type Word = { el: HTMLElement; scene: number; t: number; x: number; y: number };

// One continuous position drives the story. Scrolling moves a target; the position glides after it,
// so the text answers the hand directly and linearly, and comes to rest on a whole scene when the hand stops.
export function useStory(ids: string[]) {
  const root = useRef<HTMLDivElement>(null);
  const initial = Math.max(0, ids.indexOf(location.hash.slice(1)));
  const [active, setActive] = useState(initial);
  const api = useRef<{ go: (index: number) => void }>({ go: () => {} });

  useEffect(() => {
    const stage = root.current!, last = ids.length - 1;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sections = [...stage.querySelectorAll<HTMLElement>(".scene")];
    const fill = stage.querySelector<HTMLElement>("[data-progress]")!;
    let words: Word[] = [];
    let target = initial, p = initial, lastInput = 0, direction = 0, touching = false, shown = -1;
    let px = innerWidth * .3, py = innerHeight * .4, tx = px, ty = py, dwell = 0, mouse = false;

    // Word positions are measured once per layout, not per frame.
    const measure = () => {
      words = sections.flatMap((section, scene) => {
        const list = [...section.querySelectorAll<HTMLElement>(".w")];
        return list.map((el, i) => {
          const box = el.getBoundingClientRect(), shift = new DOMMatrix(getComputedStyle(el).transform).m42;
          return { el, scene, t: list.length > 1 ? i / (list.length - 1) : 0, x: box.left + box.width / 2, y: box.top - shift + box.height / 2 };
        });
      });
    };

    const paint = () => {
      const lit = mouse && !reduced.matches;
      const radius = 150 + 90 * dwell;
      for (const word of words) {
        const d = p - word.scene;
        if (Math.abs(d) >= .5) { if (word.el.style.opacity !== "0") word.el.style.opacity = "0"; continue; }
        // Each scene enters over the half step before it and leaves over the half step after it,
        // word by word in reading order, so two scenes never share the screen.
        const stagger = .5, enter = clamp(1 + 2 * d), leave = clamp(2 * d);
        const shown = clamp((enter - stagger * word.t) / (1 - stagger)), gone = clamp((leave - stagger * word.t) / (1 - stagger));
        const travel = reduced.matches ? 0 : 14;
        word.el.style.opacity = (shown * (1 - gone)).toFixed(3);
        word.el.style.transform = `translate3d(0,${((1 - shown) * travel - gone * travel).toFixed(2)}px,0)`;
        const glow = lit ? Math.exp(-((word.x - px) ** 2 + (word.y - py) ** 2) / (2 * radius * radius)) * (.4 + .6 * dwell) : 0;
        word.el.style.setProperty("--lit", glow.toFixed(3));
      }
      sections.forEach((section, index) => { section.style.visibility = Math.abs(p - index) < .5 ? "visible" : "hidden"; });
      fill.style.transform = `scaleX(${(p / last).toFixed(4)})`;
      stage.style.setProperty("--torch-x", `${px.toFixed(1)}px`);
      stage.style.setProperty("--torch-y", `${py.toFixed(1)}px`);
      stage.style.setProperty("--dwell", lit ? dwell.toFixed(3) : "0");
      stage.style.setProperty("--start", clamp(1 - p * 2).toFixed(3));
      const now = Math.round(p);
      if (now !== shown) {
        shown = now; setActive(now);
        history.replaceState(null, "", now ? `#${ids[now]}` : location.pathname + location.search);
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000, now = performance.now();
      // Released: settle on the scene in the direction of travel once a quarter of the way there.
      if (!touching && now - lastInput > 160) {
        const base = Math.floor(target), frac = target - base;
        target = frac === 0 ? target : direction > 0 ? (frac > .25 ? base + 1 : base) : direction < 0 ? (frac < .75 ? base : base + 1) : Math.round(target);
      }
      const follow = reduced.matches ? 1 : 1 - Math.exp(-dt / .32);
      p += (target - p) * follow;
      if (Math.abs(target - p) < .0005) p = target;
      const glide = 1 - Math.exp(-dt / .18);
      const dx = (tx - px) * glide, dy = (ty - py) * glide;
      px += dx; py += dy;
      const speed = Math.hypot(dx, dy) / Math.max(dt, .001);
      // Resting builds the light over about three seconds; moving lets it relax.
      dwell = clamp(dwell + (speed < 25 ? dt / 3 : -dt * Math.min(2, speed / 300)));
      paint();
    };

    const go = (index: number) => { target = clamp(Math.round(index), 0, last); direction = 0; lastInput = 0; };
    api.current.go = go;
    const nudge = (amount: number) => { target = clamp(target + amount, 0, last); direction = Math.sign(amount) || direction; lastInput = performance.now(); };

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? innerHeight : 1);
      nudge(pixels / Math.max(700, innerHeight * 1.1));
    };
    let startY = 0, startX = 0, base = 0;
    const touchStart = (event: TouchEvent) => { touching = event.touches.length === 1; startX = event.touches[0].clientX; startY = event.touches[0].clientY; base = target; };
    const touchMove = (event: TouchEvent) => {
      if (!touching) return;
      const dy = startY - event.touches[0].clientY, dx = startX - event.touches[0].clientX;
      if (Math.abs(dx) > Math.abs(dy)) return;
      event.preventDefault();
      const next = clamp(base + dy / (innerHeight * .7), 0, last);
      direction = Math.sign(next - target) || direction; target = next; lastInput = performance.now();
    };
    const touchEnd = () => { touching = false; };
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === " " && (event.target as HTMLElement).closest("a,button")) return;
      const forward = ["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey);
      const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey);
      if (forward || back) { event.preventDefault(); go(Math.round(target) + (forward ? 1 : -1)); }
      else if (event.key === "Home") go(0);
      else if (event.key === "End") go(last);
    };
    const pointer = (event: PointerEvent) => { mouse = event.pointerType === "mouse"; if (mouse) { tx = event.clientX; ty = event.clientY; } };
    const hash = () => go(Math.max(0, ids.indexOf(location.hash.slice(1))));

    measure();
    paint();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    document.fonts.ready.then(measure);
    gsap.ticker.add(tick);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("keydown", key);
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("hashchange", hash);
    return () => {
      gsap.ticker.remove(tick); observer.disconnect();
      window.removeEventListener("wheel", wheel); window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove); window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("keydown", key); window.removeEventListener("pointermove", pointer); window.removeEventListener("hashchange", hash);
    };
    // The story is mounted once; ids never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { root, active, go: (index: number) => api.current.go(index) };
}
