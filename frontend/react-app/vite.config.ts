import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // The React Compiler memoises the DOM overlay automatically, so scroll-driven
  // state changes never cascade into re-renders of untouched subtrees.
  plugins: [react({ compiler: true })],
  // Deployed to GitHub Pages as a project site: https://krishnapilato.github.io/portfolio/
  base: "/portfolio/",
  build: {
    target: "baseline-widely-available",
    // Fonts and generated assets stay as files so the HTML shell paints first.
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // Split the renderer from React so each is cached independently and
        // the two download in parallel; a three.js bump never busts the
        // React chunk and vice versa.
        codeSplitting: {
          groups: [
            { name: "three", test: /node_modules[\\/]three[\\/]/ },
            { name: "r3f", test: /node_modules[\\/](@react-three|postprocessing|n8ao|maath|troika|zustand|suspend-react|its-fine|use-sync-external-store)[\\/]/ },
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
});
