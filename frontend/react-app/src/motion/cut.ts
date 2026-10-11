import { gsap, ScrollTrigger } from "./gsap";
import { arrivalMark } from "./mark";

/**
 * Jumps are cuts. A link to another page of the book lands there at once:
 * no smooth scroll racing through the scrubbed scenes. The scrub smoothing
 * is finished so the picture is settled on arrival, focus moves to the
 * page's heading (for keyboards and screen readers), and a short pencil
 * mark shows where you landed.
 */
export function cutTo(id: string, { focus = true, mark = true } = {}) {
  const target = document.getElementById(id);
  if (!target) return false;
  const leaf = target.closest<HTMLElement>(".leaf");
  const passage = ScrollTrigger.getById("passage");
  let top: number;
  if (passage && leaf && passage.isActive !== undefined && document.documentElement.classList.contains("is-passage")) {
    const track = leaf.parentElement as HTMLElement;
    const stage = track.parentElement as HTMLElement;
    const max = track.scrollWidth - stage.clientWidth;
    const x = gsap.utils.clamp(0, max, leaf.offsetLeft + leaf.offsetWidth / 2 - stage.clientWidth / 2);
    top = passage.start + (max > 0 ? x / max : 0) * (passage.end - passage.start);
  } else {
    const stageStart = target.matches("#one-habit, #experience, #title");
    top = target.getBoundingClientRect().top + window.scrollY - (stageStart ? 0 : Math.round(window.innerHeight * 0.12));
  }
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  ScrollTrigger.update();
  for (const trigger of ScrollTrigger.getAll()) trigger.getTween?.()?.progress(1);
  const heading = (leaf ?? target).querySelector<HTMLElement>("h1, h2, h3") ?? target;
  if (focus) {
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
  if (history.replaceState) history.replaceState(null, "", `#${id}`);
  if (mark) arrivalMark(heading);
  return true;
}

/** On load, a #page hash lands on that page without moving focus. */
export function initialHash() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!id) return;
  cutTo(id, { focus: false, mark: false });
}

/**
 * Click handler for in-book links (Contents, Index, Next, skip links).
 * Modified clicks keep the browser's own behaviour (open in a new tab).
 */
export function onCut(event: { preventDefault(): void; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number }, id: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  if (cutTo(id)) event.preventDefault();
}
