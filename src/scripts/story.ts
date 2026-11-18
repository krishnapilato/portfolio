import gsap from "gsap";

const clamp = (value: number, last: number): number => Math.max(0, Math.min(last, value));

function setupProjects(stage: HTMLElement): void {
  const tabs = [...stage.querySelectorAll<HTMLButtonElement>("[data-project]")];
  const panels = [...stage.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  const select = (index: number, focus = false): void => {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (focus) tabs[index]?.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", event => {
      const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: tabs.length - 1 - index };
      const offset = offsets[event.key];
      if (offset === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      select((index + offset + tabs.length) % tabs.length, true);
    });
  });
  select(0);
}

function setupCopy(stage: HTMLElement): void {
  const button = stage.querySelector<HTMLButtonElement>("[data-copy]");
  const status = stage.querySelector<HTMLElement>("[data-copy-status]");
  button?.addEventListener("click", async () => {
    const email = button.dataset["copy"] ?? "";
    if (!status || !/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)) return;
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = "Address copied.";
    } catch {
      status.textContent = "Copy is unavailable. You can select the email address above.";
    }
  });
}

function setupInputs(go: (index: number) => void, current: () => number, last: number): void {
  let wheelSum = 0, lastWheel = 0, wheelConsumed = false;
  addEventListener("wheel", event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel > 180) { wheelSum = 0; wheelConsumed = false; }
    lastWheel = now;
    if (wheelConsumed) return;
    wheelSum += event.deltaY * ([1, 32, innerHeight][event.deltaMode] ?? 1);
    if (Math.abs(wheelSum) < 40) return;
    wheelConsumed = true;
    go(current() + Math.sign(wheelSum));
  }, { passive: false });

  let touch: { x: number; y: number } | undefined;
  addEventListener("touchstart", event => {
    const first = event.touches[0];
    touch = event.touches.length === 1 && first ? { x: first.clientX, y: first.clientY } : undefined;
  }, { passive: true });
  addEventListener("touchmove", event => {
    if (touch && event.touches.length === 1) event.preventDefault();
  }, { passive: false });
  addEventListener("touchend", event => {
    const end = event.changedTouches[0];
    if (touch && end) {
      const dy = touch.y - end.clientY, dx = touch.x - end.clientX;
      if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx)) go(current() + Math.sign(dy));
    }
    touch = undefined;
  }, { passive: true });
  addEventListener("touchcancel", () => { touch = undefined; }, { passive: true });
  addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.key === " " && event.target instanceof Element && event.target.closest("a, button")) return;
    const moves: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1, " ": event.shiftKey ? -1 : 1, Home: -current(), End: last - current() };
    const offset = moves[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    go(current() + offset);
  });
}

export function startStory(stage: HTMLElement | null): void {
  if (!stage) return;
  const scenes = [...stage.querySelectorAll<HTMLElement>("[data-scene]")];
  const links = [...stage.querySelectorAll<HTMLAnchorElement>("[data-go]")];
  const announce = stage.querySelector<HTMLElement>("[data-announce]");
  const fromHash = (): number => Math.max(0, scenes.findIndex(scene => scene.id === location.hash.slice(1)));
  let active = fromHash(), busy = false;
  let timeline: gsap.core.Timeline | undefined;

  const show = (index: number): void => {
    active = index;
    scenes.forEach((scene, i) => { scene.inert = i !== index; scene.setAttribute("aria-hidden", String(i !== index)); scene.style.visibility = i === index ? "visible" : "hidden"; });
    links.forEach(link => {
      if (Number(link.dataset["go"]) === index) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    const scene = scenes[index];
    if (announce) announce.textContent = `${index + 1} of ${scenes.length}: ${scene?.querySelector("h1, h2")?.textContent ?? ""}`;
    history.replaceState(null, "", index === 0 ? location.pathname + location.search : `#${scene?.id}`);
  };

  const go = (index: number): void => {
    const next = clamp(index, scenes.length - 1);
    if (busy || next === active) return;
    const outgoing = scenes[active], incoming = scenes[next];
    if (!outgoing || !incoming) return;
    const restoreFocus = outgoing.contains(document.activeElement);
    const direction = next > active ? 1 : -1;
    const enter = [...incoming.querySelectorAll<HTMLElement>(".reveal")];
    const finish = (): void => {
      show(next);
      gsap.set(enter, { clearProps: "opacity,transform,filter" });
      busy = false;
      stage.dataset["state"] = "idle";
      if (restoreFocus) incoming.querySelector<HTMLElement>("h1, h2")?.focus({ preventScroll: true });
    };
    busy = true;
    stage.dataset["state"] = "transitioning";
    timeline = gsap.timeline({ onComplete: finish });
    timeline.to(outgoing.querySelectorAll(".reveal"), { opacity: 0, y: -10 * direction, filter: "blur(4px)", duration: .4, stagger: .035, ease: "sine.inOut" });
    timeline.call(() => {
      show(next);
      gsap.set(outgoing.querySelectorAll(".reveal"), { clearProps: "opacity,transform,filter" });
    }, [], "+=0.5");
    timeline.fromTo(enter, { opacity: 0, y: 12 * direction, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .95, stagger: .065, ease: "power2.out" });
  };

  setupProjects(stage);
  setupCopy(stage);
  show(active);
  stage.dataset["ready"] = "";
  stage.dataset["state"] = "idle";
  links.forEach(link => link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(Number(link.dataset["go"]));
  }));
  setupInputs(go, () => active, scenes.length - 1);
  addEventListener("hashchange", () => {
    const requested = fromHash();
    if (busy) timeline?.progress(1);
    go(requested);
  });
}
