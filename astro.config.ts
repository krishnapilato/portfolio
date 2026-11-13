import { defineConfig } from "astro/config";

// Static output for GitHub Pages. Every page gets a Content Security Policy in a <meta> element;
// Astro adds hashes for its own scripts and styles, and everything else is denied unless listed here.
export default defineConfig({
  site: "https://krishnapilato.github.io",
  base: "/portfolio",
  output: "static",
  trailingSlash: "ignore",
  devToolbar: { enabled: false },
  // No code blocks on the site, and Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },
  build: { inlineStylesheets: "never", assets: "assets" },
  security: {
    checkOrigin: true,
    csp: {
      algorithm: "SHA-384",
      directives: [
        "default-src 'none'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'none'",
        "manifest-src 'self'",
        "media-src 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        "worker-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "upgrade-insecure-requests",
        "require-trusted-types-for 'script'",
        "trusted-types 'none'",
      ],
    },
  },
});
