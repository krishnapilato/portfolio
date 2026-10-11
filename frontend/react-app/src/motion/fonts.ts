let ready: Promise<void> | null = null;

/**
 * Resolves when the web fonts have loaded, or after 600 ms, whichever comes
 * first. Lines are measured and split only after this, so a font swap never
 * changes where a line breaks halfway through its reveal.
 */
export function fontsReady(): Promise<void> {
  if (ready) return ready;
  const fonts = typeof document !== "undefined" ? document.fonts : undefined;
  ready = Promise.race([
    fonts ? fonts.ready.then(() => undefined) : Promise.resolve(),
    new Promise<void>((resolve) => setTimeout(resolve, 600)),
  ]);
  return ready;
}
