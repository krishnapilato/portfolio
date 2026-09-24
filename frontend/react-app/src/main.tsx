import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/film.css";
import "./styles/readout.css";
import App from "./App.tsx";
import { useTimeline } from "./lib/store";

document.documentElement.classList.add("js");
// Diagnostics hook for the screenshot rig and the browser console.
(window as unknown as { __timeline: typeof useTimeline }).__timeline = useTimeline;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
