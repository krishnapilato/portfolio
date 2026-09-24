import { useEffect, useState } from "react";
import { BEATS } from "./content/beats";
import { decideTier, probeDevice } from "./lib/device";
import { applyDeepLink, startEnvironmentSync, startKeyboardStepping } from "./lib/interaction";
import { startScroll } from "./lib/scroll";
import { useTimeline } from "./lib/store";
import CameraRig from "./scene/CameraRig";
import Experience from "./scene/Experience";
import Instrument from "./scene/Instrument";
import { BEAT_IDS, KEYFRAMES } from "./scene/keyframes";
import Stage from "./scene/Stage";
import Beats, { type BeatContent } from "./ui/Beats";
import Curtain from "./ui/Curtain";
import Links from "./ui/Links";
import Readout from "./ui/Readout";

const CONTENT: BeatContent[] = BEATS.map((beat, index) => ({
  id: beat.id,
  weight: KEYFRAMES[index].weight,
  hold: KEYFRAMES[index].hold,
  arriveShare: KEYFRAMES[index].arriveShare,
  arriveFrac: KEYFRAMES[index].arriveFrac,
  kicker: beat.kicker,
  title: beat.title,
  body: beat.body,
  meta: beat.meta,
  children: beat.links ? <Links links={beat.links} compact={beat.id !== "contact"} /> : undefined,
}));

const LABELS = BEATS.map((beat) => ({ id: beat.id, label: beat.readout, tickLabel: beat.tickLabel }));

export default function App() {
  // Decided once, before anything renders: which tier this device gets.
  const [boot] = useState(() => {
    const probe = probeDevice();
    return { tier: decideTier(probe), webgl: probe.webgl, reducedMotion: probe.reducedMotion };
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
    useTimeline.getState().set({ tier: boot.tier, webgl: boot.webgl, reducedMotion: boot.reducedMotion });
    const stopEnvironment = startEnvironmentSync();
    const stopScroll = startScroll(boot.reducedMotion);
    const stopKeys = startKeyboardStepping(BEAT_IDS);
    applyDeepLink(BEAT_IDS);
    return () => {
      stopEnvironment();
      stopScroll();
      stopKeys();
    };
  }, [boot]);

  return (
    <>
      <a className="skip" href="#contact">Skip to contact</a>

      {webgl && !lost ? (
        <Experience>
          <Stage />
          <Instrument />
          <CameraRig keyframes={KEYFRAMES} />
        </Experience>
      ) : null}

      <Curtain />

      <main className="film">
        <Beats beats={CONTENT} />
      </main>

      <Readout labels={LABELS} />
    </>
  );
}
