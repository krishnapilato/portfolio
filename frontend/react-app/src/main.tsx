import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production HTML already holds the whole page (prerendered at build
// time), so React adopts it in place; the dev server starts from empty.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
