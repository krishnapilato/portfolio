import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  // The React Compiler memoises components automatically, so state changes
  // (a copied address, a resize) never re-render untouched sections.
  plugins: [react({ compiler: true })],
  // Deployed to GitHub Pages as a project site: https://krishnapilato.github.io/portfolio/
  base: "/portfolio/",
  build: {
    target: "baseline-widely-available",
    // Fonts stay as files so they cache across visits; nothing is inlined
    // into the scripts.
    assetsInlineLimit: 0,
    // The server build exists only to prerender the HTML; it copies nothing.
    copyPublicDir: !isSsrBuild,
    rolldownOptions: isSsrBuild
      ? {}
      : {
          output: {
            // React and GSAP are cached independently of the page's own code,
            // which changes far more often than either library.
            codeSplitting: {
              groups: [
                { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 20 },
                { name: "gsap", test: /node_modules[\\/](gsap|@gsap)[\\/]/, priority: 10 },
              ],
            },
          },
        },
  },
}));
