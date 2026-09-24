import { lazy, Suspense, useEffect, useState } from "react";
import { BEATS } from "./content/beats";
import { computeRanges } from "./lib/beats";
import { decideTier, probeDevice } from "./lib/device";
import { applyDeepLink, focusBeatTitle, goToBeat, startEnvironmentSync, startHashMirror, startNavigation } from "./lib/interaction";
import { startScroll } from "./lib/scroll";
import { useTimeline } from "./lib/store";
import { KEYFRAMES } from "./scene/keyframes";
import Beats, { type BeatContent } from "./ui/Beats";
import Curtain from "./ui/Curtain";
import Links from "./ui/Links";
import Readout from "./ui/Readout";

// The renderer is the heavy part; it loads after the first paint.
const Scene = lazy(() => import("./scene/Scene"));

const CONTENT: BeatContent[] = BEATS.map((beat, index) => ({
  id: beat.id,
  weight: KEYFRAMES[index].weight,
  hold: KEYFRAMES[index].hold,
  arriveShare: KEYFRAMES[index].arriveShare,
  arriveFrac: KEYFRAMES[index].arriveFrac,
  kicker: beat.kicker,
  title: beat.title,
  titleLinks: beat.titleLinks,
  body: beat.body,
  meta: beat.meta,
  metaLink: beat.metaLink,
  hint: beat.hint,
  scrim: KEYFRAMES[index].frame === "case" || KEYFRAMES[index].scrim === true,
  children: beat.links ? <Links links={beat.links} /> : undefined,
}));

const LABELS = BEATS.map((beat) => ({ id: beat.id, label: beat.readout, tickLabel: beat.tickLabel }));
const RANGES = computeRanges(KEYFRAMES);

export default function App() {
  // Decided once, before anything renders: which tier this device gets.
  const [boot] = useState(() => {
    const probe = probeDevice();
    // ?tier=high|mid|low forces a tier: for testing on hardware that is not
    // the visitor's, never something a visitor needs.
    const forced = new URLSearchParams(location.search).get("tier");
    const tier = forced === "high" || forced === "mid" || forced === "low" ? forced : decideTier(probe);
    return { tier, webgl: probe.webgl, reducedMotion: probe.reducedMotion };
  });
  const webgl = useTimeline((s) => s.webgl);
  const lost = useTimeline((s) => s.contextLost);
  const ready = useTimeline((s) => s.ready);

  // The stylesheet reads these: the canvas fades in on ready, and the low
  // tier gets its grain and vignette from CSS instead of the GPU.
  useEffect(() => {
    document.documentElement.dataset.ready = String(ready && webgl && !lost);
    document.documentElement.dataset.tier = boot.tier;
  }, [ready, webgl, lost, boot.tier]);

  useEffect(() => {
    useTimeline.getState().set({ tier: boot.tier, quality: boot.tier, webgl: boot.webgl, reducedMotion: boot.reducedMotion });
    const stopEnvironment = startEnvironmentSync();
    const stopScroll = startScroll(boot.reducedMotion, RANGES);
    const stopNavigation = startNavigation(KEYFRAMES);
    // The deep link is read before the mirror starts writing the hash.
    applyDeepLink();
    const stopMirror = startHashMirror();
    return () => {
      stopMirror();
      stopNavigation();
      stopScroll();
      stopEnvironment();
    };
  }, [boot]);

  return (
    <>
      <a
        className="skip"
        href="#contact-title"
        onClick={(event) => {
          if (!goToBeat("contact")) return;
          event.preventDefault();
          // The heading takes focus once its block is readable, not before.
          focusBeatTitle("contact");
        }}
      >
        Skip to contact
      </a>

      {/* Gated on the probe, not the store default, so a browser without
          WebGL never downloads the renderer. A lost context keeps the
          scene mounted behind the curtain, so a restored one resumes. */}
      {boot.webgl && webgl ? (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      ) : null}

      <Curtain />

      <main className="film">
        <Beats beats={CONTENT} />
      </main>

      <Readout labels={LABELS} />
    </>
  );
}
