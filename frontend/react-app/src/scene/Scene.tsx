import CameraRig from "./CameraRig";
import Experience from "./Experience";
import Instrument from "./Instrument";
import { KEYFRAMES } from "./keyframes";
import Stage from "./Stage";

/**
 * The whole 3D film behind one lazy boundary, so the words paint first and
 * the renderer arrives while the visitor reads the opening line.
 */
export default function Scene() {
  return (
    <Experience>
      <Stage />
      <Instrument />
      <CameraRig keyframes={KEYFRAMES} />
    </Experience>
  );
}
