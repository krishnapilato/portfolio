import { useEffect, useRef } from "react";

/**
 * Tracks normalised mouse position [-1, 1] on both axes.
 * Returns a ref (not state) to avoid re-renders on every frame.
 */
export function useMousePosition() {
  const pos = useRef({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      pos.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pos.current.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return pos;
}
