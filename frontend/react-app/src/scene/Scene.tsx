import { use } from "react";
import { useTimeline } from "../lib/store";
import { loadMaps } from "../textures/library";
import CameraRig from "./CameraRig";
import Experience from "./Experience";
import Instrument from "./Instrument";
import { KEYFRAMES } from "./keyframes";
import Stage from "./Stage";

/**
 * The whole 3D film behind one lazy boundary, so the words paint first and
 * the renderer arrives while the visitor reads the opening line. The maps
 * are generated in a worker before anything mounts: this suspends until
 * they exist, and the main thread never stops answering the scroll.
 */
export default function Scene() {
  const tier = useTimeline((s) => s.tier);
  use(loadMaps(tier));
  return (
    <Experience>
      <Stage />
      <Instrument />
      <CameraRig keyframes={KEYFRAMES} />
    </Experience>
  );
}
