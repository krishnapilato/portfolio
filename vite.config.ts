import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "production-content-security-policy",
    apply: "build",
    transformIndexHtml() {
      return [{
        tag: "meta",
        attrs: {
          "http-equiv": "Content-Security-Policy",
          content: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
        },
        injectTo: "head-prepend",
      }];
    },
  }],
  base: "/portfolio/",
  build: {
    // Split the animation runtime from React so each is cached independently
    // and the two download in parallel.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap")) return "gsap";
        },
      },
    },
  },
});
