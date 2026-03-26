import { clsx } from "clsx";

/**
 * Utility: merge class names (clsx-compatible).
 * With Tailwind v4 we don't need tailwind-merge since v4 handles specificity natively.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
