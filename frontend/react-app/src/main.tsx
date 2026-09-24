import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/film.css";
import "./styles/readout.css";
import App from "./App.tsx";
import { useTimeline } from "./lib/store";
import { cameraState } from "./scene/palette";

document.documentElement.classList.add("js");
// Diagnostics hook for the screenshot rig and the browser console.
const diagnostics = window as unknown as { __timeline: typeof useTimeline; __camera: typeof cameraState };
diagnostics.__timeline = useTimeline;
diagnostics.__camera = cameraState;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
