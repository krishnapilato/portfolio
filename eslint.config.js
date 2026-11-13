import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", ".astro"]),
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  astro.configs["flat/recommended"],
  {
    languageOptions: { globals: globals.browser },
    rules: {
      // No dynamic code, no HTML sinks: the site renders only escaped text.
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-restricted-properties": ["error",
        { property: "innerHTML", message: "Render text with textContent or in an Astro template." },
        { property: "outerHTML", message: "Render text with textContent or in an Astro template." },
        { object: "document", property: "write", message: "document.write is not allowed." },
      ],
      "no-restricted-syntax": ["error",
        { selector: "CallExpression[callee.property.name='insertAdjacentHTML']", message: "HTML insertion is not allowed." },
      ],
      "astro/no-set-html-directive": "error",
      "astro/no-unsafe-inline-scripts": "error",
      eqeqeq: "error",
    },
  },
]);
