import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { validateContent } from "./content/validate";

/**
 * Renders the whole page once at build time (see scripts/prerender.mjs).
 * The copy is validated first, so an edit whose words cannot be paired or
 * an index entry that cites the wrong page fails the build.
 */
export function render(): string {
  validateContent();
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
