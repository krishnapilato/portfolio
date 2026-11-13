import gsap from "gsap";

/*
  The story engine. One number, the position, says where the reader is: 0 is the first scene, 1 the second.
  Wheel, touch and keys move a target; the position glides after it, and every word's opacity and offset are a
  linear function of the position. The story follows the hand only: it never jumps to a scene on its own.

  Around each scene there is a stretch where it stands complete; beyond it the words fade word by word, and
  between two scenes there is empty paper, so two scenes never share the screen. If the hand stops inside a fade,
  the story keeps drifting slowly in the same direction until the next scene stands complete, like momentum.

  Inputs are numbers, a fixed set of keys and the URL fragment. The fragment is only ever compared against the
  known scene ids; nothing read from the URL or the DOM is written back as markup.
*/

const HOLD = 0.12;          // distance from a scene within which it stands complete
const REVEAL = 0.36;        // distance at which it has fully faded; from here to the next scene, a pause of empty paper
const STAGGER = 0.5;        // how far apart, within a fade, the first and last word start
const TRAVEL_PX = 12;       // how far a word rises while it appears
const GLIDE_S = 0.2;        // how closely the story follows the hand
const DRIFT_S = 0.9;        // how gently it drifts out of a fade once the hand has stopped
const AUTO_SPEED = 0.55;    // scenes per second when the story moves on its own, so the empty pause is felt
const REST_AFTER_MS = 450;  // how long the hand must be still before that drift begins
const FLING = 0.28;         // how much of a swipe's speed carries on after the finger lifts
const WHEEL_STEP_PX = 1000; // wheel distance for one scene, at least; taller screens need a little more
const LIGHT_DWELL_S = 3;    // how long the pointer must rest for the light to reach full strength

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i;

interface Unit { el: HTMLElement; scene: number; order: number; x: number; y: number }

export function startStory(stage: HTMLElement | null): void {
  if (!stage) return;
  const scenes = [...stage.querySelectorAll<HTMLElement>("[data-scene]")];
  const ids = scenes.map(scene => scene.dataset["scene"] ?? "");
  const progress = stage.querySelector<HTMLElement>("[data-progress]");
  const announce = stage.querySelector<HTMLElement>("[data-announce]");
  const counter = stage.querySelector<HTMLElement>("[data-counter]");
  const steps = [...stage.querySelectorAll<HTMLButtonElement>("[data-step]")];
  const jumps = [...stage.querySelectorAll<HTMLAnchorElement>("[data-go]")];
  const last = scenes.length - 1;
  if (last < 1) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fromHash = (): number => Math.max(0, ids.indexOf(location.hash.slice(1)));

  let target = fromHash(), position = target, direction = 1, lastInput = 0, touching = false, active = -1, auto = false;
  let units: Unit[] = [];
  const light = { x: innerWidth / 2, y: innerHeight * 0.4, toX: innerWidth / 2, toY: innerHeight * 0.4, dwell: 0, on: false };

  // Word centres are measured once per layout, without their reveal offset, and reused every frame.
  const measure = (): void => {
    units = scenes.flatMap((scene, index) => {
      const words = [...scene.querySelectorAll<HTMLElement>(".w")];
      return words.map((el, order) => {
        const box = el.getBoundingClientRect();
        const shift = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
        return { el, scene: index, order: words.length > 1 ? order / (words.length - 1) : 0, x: box.left + box.width / 2, y: box.top - shift + box.height / 2 };
      });
    });
  };

  const show = (index: number): void => {
    active = index;
    scenes.forEach((scene, i) => { scene.inert = i !== index; scene.setAttribute("aria-hidden", String(i !== index)); });
    steps.forEach(button => { button.disabled = Number(button.dataset["step"]) < 0 ? index === 0 : index === last; });
    jumps.forEach(link => { link.hidden = Number(link.dataset["go"]) === index; });
    if (counter) counter.textContent = String(index + 1).padStart(2, "0");
    if (announce) announce.textContent = `${index + 1} of ${scenes.length}: ${scenes[index]?.querySelector("h1, h2")?.textContent ?? ""}`;
    history.replaceState(null, "", index === 0 ? location.pathname + location.search : `#${ids[index]}`);
  };

  const paint = (): void => {
    const lit = light.on && !reduced.matches;
    const radius = 150 + 90 * light.dwell;
    const travel = reduced.matches ? 0 : TRAVEL_PX;
    for (const unit of units) {
      const d = position - unit.scene;
      if (Math.abs(d) >= REVEAL) { unit.el.style.opacity = "0"; continue; }
      const enter = d < 0 ? clamp((d + REVEAL) / (REVEAL - HOLD)) : 1;
      const leave = d > 0 ? clamp((d - HOLD) / (REVEAL - HOLD)) : 0;
      const shown = clamp((enter - STAGGER * unit.order) / (1 - STAGGER));
      const gone = clamp((leave - STAGGER * unit.order) / (1 - STAGGER));
      unit.el.style.opacity = (shown * (1 - gone)).toFixed(3);
      unit.el.style.transform = `translate3d(0, ${((1 - shown - gone) * travel).toFixed(2)}px, 0)`;
      const glow = lit ? Math.exp(-((unit.x - light.x) ** 2 + (unit.y - light.y) ** 2) / (2 * radius * radius)) * (0.4 + 0.6 * light.dwell) : 0;
      unit.el.style.setProperty("--lit", glow.toFixed(3));
    }
    scenes.forEach((scene, i) => { scene.style.visibility = Math.abs(position - i) < REVEAL ? "visible" : "hidden"; });
    progress?.style.setProperty("transform", `scaleX(${(position / last).toFixed(4)})`);
    stage.style.setProperty("--light-x", `${light.x.toFixed(1)}px`);
    stage.style.setProperty("--light-y", `${light.y.toFixed(1)}px`);
    stage.style.setProperty("--dwell", lit ? light.dwell.toFixed(3) : "0");
    stage.style.setProperty("--opening", clamp(1 - position * 3).toFixed(3));
    const nearest = Math.round(position);
    if (nearest !== active) show(nearest);
  };

  const tick = (_time: number, deltaMs: number): void => {
    const dt = Math.min(deltaMs, 50) / 1000;
    const resting = !touching && performance.now() - lastInput > REST_AFTER_MS;
    if (resting) {
      const base = Math.floor(target), fraction = target - base;
      if (fraction > HOLD && fraction < 1 - HOLD) target = direction < 0 ? base + HOLD : base + 1 - HOLD;
    }
    // Following the hand, the story glides; moving on its own, it also keeps an even pace through the pause.
    const self = resting || auto;
    let move = (target - position) * (reduced.matches ? 1 : 1 - Math.exp(-dt / (self ? DRIFT_S : GLIDE_S)));
    if (self && !reduced.matches) move = clamp(move, -AUTO_SPEED * dt, AUTO_SPEED * dt);
    position += move;
    if (Math.abs(target - position) < 0.0005) position = target;
    const follow = reduced.matches ? 1 : 1 - Math.exp(-dt / 0.18);
    const dx = (light.toX - light.x) * follow, dy = (light.toY - light.y) * follow;
    light.x += dx; light.y += dy;
    const speed = Math.hypot(dx, dy) / Math.max(dt, 0.001);
    light.dwell = clamp(light.dwell + (speed < 25 ? dt / LIGHT_DWELL_S : -dt * Math.min(2, speed / 300)));
    paint();
  };

  // Buttons and keys move a whole scene; the glide still makes the change gradual.
  const go = (index: number): void => { const next = clamp(Math.round(index), 0, last); direction = Math.sign(next - target) || direction; target = next; auto = true; lastInput = performance.now(); };
  const nudge = (amount: number): void => {
    if (!Number.isFinite(amount) || amount === 0) return;
    target = clamp(target + amount, 0, last); direction = Math.sign(amount); auto = false; lastInput = performance.now();
  };

  const onWheel = (event: WheelEvent): void => {
    if (event.ctrlKey) return;
    event.preventDefault();
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 32 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
    nudge((event.deltaY * unit) / Math.max(WHEEL_STEP_PX, innerHeight * 1.1));
  };
  let startX = 0, startY = 0, startTarget = 0, velocity = 0, lastY = 0, lastTime = 0;
  const onTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0];
    touching = event.touches.length === 1 && touch !== undefined;
    if (touch) { startX = touch.clientX; startY = lastY = touch.clientY; startTarget = target; velocity = 0; lastTime = performance.now(); }
  };
  const onTouchMove = (event: TouchEvent): void => {
    const touch = event.touches[0];
    if (!touching || !touch) return;
    const dy = startY - touch.clientY, dx = startX - touch.clientX;
    if (Math.abs(dx) > Math.abs(dy)) return;
    event.preventDefault();
    const now = performance.now(), span = innerHeight * 0.8;
    // Speed in scenes per second, smoothed, so a swipe can carry on a little after the finger lifts.
    if (now > lastTime) velocity = velocity * 0.6 + 0.4 * ((lastY - touch.clientY) / span) / ((now - lastTime) / 1000);
    lastY = touch.clientY; lastTime = now;
    const next = clamp(startTarget + dy / span, 0, last);
    direction = Math.sign(next - target) || direction; target = next; auto = false; lastInput = now;
  };
  const onTouchEnd = (): void => {
    if (!touching) return;
    touching = false;
    if (performance.now() - lastTime < 80 && Number.isFinite(velocity)) target = clamp(target + velocity * FLING, 0, last);
    lastInput = performance.now();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === " " && event.target instanceof Element && event.target.closest("a, button")) return;
    const forward = ["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey);
    const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey);
    if (forward || back) { event.preventDefault(); go(Math.round(target) + (forward ? 1 : -1)); }
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(last);
  };
  const onPointer = (event: PointerEvent): void => {
    light.on = event.pointerType === "mouse";
    if (light.on) { light.toX = event.clientX; light.toY = event.clientY; }
  };

  steps.forEach(button => button.addEventListener("click", () => go(Math.round(target) + Math.sign(Number(button.dataset["step"])))));
  jumps.forEach(link => link.addEventListener("click", event => {
    const index = Number(link.dataset["go"]);
    if (!Number.isInteger(index)) return;
    event.preventDefault(); go(index);
  }));
  stage.querySelector<HTMLButtonElement>("[data-copy]")?.addEventListener("click", async event => {
    const button = event.currentTarget as HTMLButtonElement, value = button.dataset["copy"] ?? "";
    if (!EMAIL.test(value) || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    button.textContent = "Address copied";
  });

  stage.dataset["ready"] = "";
  measure();
  paint();
  new ResizeObserver(measure).observe(stage);
  void document.fonts.ready.then(measure);
  gsap.ticker.add(tick);
  addEventListener("wheel", onWheel, { passive: false });
  addEventListener("touchstart", onTouchStart, { passive: true });
  addEventListener("touchmove", onTouchMove, { passive: false });
  addEventListener("touchend", onTouchEnd, { passive: true });
  addEventListener("touchcancel", onTouchEnd, { passive: true });
  addEventListener("keydown", onKey);
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("hashchange", () => go(fromHash()));
}
