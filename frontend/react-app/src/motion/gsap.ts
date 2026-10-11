import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

let done = false;

/**
 * Registers the plugins and the two eases once, on the client only. Every
 * module that animates imports from here, so registration order is never
 * a question.
 */
export function setupGsap() {
  if (done || typeof window === "undefined") return;
  done = true;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  // A line being set: quick start, a long quiet landing, no overshoot.
  CustomEase.create("settle", "M0,0 C0.16,0.84 0.3,1 1,1");
  // A hand drawing a rule: a hesitant start, a sure finish.
  CustomEase.create("pencil", "M0,0 C0.45,0 0.2,1 1,1");
  // Mobile address bars resize the viewport whenever the scroll direction
  // changes; recalculating every trigger then would jolt the page.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
