import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

let registered = false;

/**
 * Registers the plugins once, on the client only. Every module that
 * animates imports from here, so registration order is never a question.
 */
export function setupGsap() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // Mobile address bars resize the viewport on every scroll direction
  // change; recalculating every trigger then would jolt the page.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
