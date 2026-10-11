import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { MEDIA, motionWindow } from "./motion/media";
import "./styles/index.css";

// The head script hides the moving parts until this module runs, with a
// safety timer for a script that never arrives. A script that was only
// slow (a cold dev server, a poor connection) still gets the motion, as
// long as the reader has not started reading.
const w = motionWindow();
window.clearTimeout(w.__motionTimer);
if (w.__motionTimedOut && window.scrollY < 40 && !window.matchMedia(MEDIA.reduce).matches) {
  w.__motionTimedOut = false;
  document.documentElement.classList.add("motion");
}

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production HTML already holds the whole page (prerendered at build
// time), so React hydrates it in place; the dev server starts from empty.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
