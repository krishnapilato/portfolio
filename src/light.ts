type Point = { x: number; y: number };

// One point of attention for the whole page. It follows the pointer, jumps to whatever
// receives keyboard focus, and otherwise rests in the reading zone so text darkens
// as it is scrolled past, by touch or by keyboard. Headings read it through --mx/--my.
export function createLight(root: HTMLElement, headings: HTMLElement[]) {
  const lamp = root.querySelector<HTMLElement>("[data-lamp]");
  const visible = new Set<HTMLElement>();
  const light: Point = { x: 0, y: 0 };
  const target: Point = { x: 0, y: 0 };
  let source: "lamp" | "pointer" | "focus" = "lamp";
  let focused: Element | null = null;
  let frame = 0;

  // Words keep their own background, so each one needs its offset inside the heading.
  const measure = () => headings.forEach((heading) => heading.querySelectorAll<HTMLElement>(".ink-word").forEach((word) => {
    word.style.setProperty("--wx", `${word.offsetLeft}px`);
    word.style.setProperty("--wy", `${word.offsetTop}px`);
  }));

  const aim = () => {
    if (source === "focus" && focused?.isConnected) {
      const box = focused.getBoundingClientRect();
      target.x = box.left + Math.min(box.width / 2, 160);
      target.y = box.top + box.height / 2;
    } else if (source === "lamp") {
      target.x = innerWidth * 0.4;
      target.y = innerHeight * 0.45;
    }
  };

  const render = () => {
    frame = 0;
    aim();
    const ease = 0.14;
    light.x += (target.x - light.x) * ease;
    light.y += (target.y - light.y) * ease;
    const boxes = [...visible].map((heading) => [heading, heading.getBoundingClientRect()] as const);
    boxes.forEach(([heading, box]) => {
      heading.style.setProperty("--mx", `${light.x - box.left}px`);
      heading.style.setProperty("--my", `${light.y - box.top}px`);
    });
    if (lamp) lamp.style.transform = `translate(${light.x}px, ${light.y}px)`;
    if (Math.abs(target.x - light.x) > 0.5 || Math.abs(target.y - light.y) > 0.5) schedule();
  };
  const schedule = () => { frame ||= requestAnimationFrame(render); };

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "touch") source = "lamp";
    else { source = "pointer"; target.x = event.clientX; target.y = event.clientY; }
    schedule();
  };
  const onFocus = (event: FocusEvent) => {
    const element = event.target as Element;
    if (!element.matches(":focus-visible") || element.id === "main") return;
    focused = element;
    source = "focus";
    schedule();
  };
  // Scrolling from the keyboard hands the attention back to the reading zone.
  const onKey = (event: KeyboardEvent) => { if (event.key !== "Tab") { source = "lamp"; schedule(); } };
  const onResize = () => { measure(); schedule(); };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target as HTMLElement) : visible.delete(entry.target as HTMLElement));
    schedule();
  }, { rootMargin: "25% 0px" });
  headings.forEach((heading) => observer.observe(heading));

  measure();
  aim();
  Object.assign(light, target);
  schedule();
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("pointerdown", onPointer, { passive: true });
  addEventListener("scroll", schedule, { passive: true });
  document.fonts.addEventListener("loadingdone", onResize);
  addEventListener("resize", onResize);
  document.addEventListener("focusin", onFocus);
  addEventListener("keydown", onKey);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    removeEventListener("pointermove", onPointer);
    removeEventListener("pointerdown", onPointer);
    removeEventListener("scroll", schedule);
    document.fonts.removeEventListener("loadingdone", onResize);
    removeEventListener("resize", onResize);
    document.removeEventListener("focusin", onFocus);
    removeEventListener("keydown", onKey);
  };
}

