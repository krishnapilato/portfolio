/**
 * useInputManager — unified input hook for desktop (WASD + mouse) and
 * mobile (virtual joystick + touch camera).
 *
 * Returns a ref containing the current normalised input state:
 *   { move: { x, y }, look: { x, y }, interact: boolean }
 *
 * Desktop:
 *   WASD / Arrow keys → move
 *   Mouse delta → look
 *
 * Mobile:
 *   Virtual joystick (via onJoystickMove) → move
 *   Right-half touch drag → look
 *   Tap → interact
 */

import { useCallback, useEffect, useRef } from "react";

export function useInputManager(isMobile) {
  const inputRef = useRef({
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    interact: false,
  });

  const keysRef = useRef(new Set());

  // ── Desktop: keyboard ──────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;

    const onDown = (e) => keysRef.current.add(e.key.toLowerCase());
    const onUp = (e) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    const tick = () => {
      const keys = keysRef.current;
      let mx = 0, my = 0;
      if (keys.has("w") || keys.has("arrowup")) my += 1;
      if (keys.has("s") || keys.has("arrowdown")) my -= 1;
      if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
      if (keys.has("d") || keys.has("arrowright")) mx += 1;
      inputRef.current.move = { x: mx, y: my };
      rafId = requestAnimationFrame(tick);
    };
    let rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // ── Desktop: mouse look ────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e) => {
      inputRef.current.look = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isMobile]);

  // ── Mobile: joystick callback ──────────────────────────────────
  const onJoystickMove = useCallback(({ x, y }) => {
    inputRef.current.move = { x, y };
  }, []);

  // ── Mobile: right-half touch for camera look ───────────────────
  useEffect(() => {
    if (!isMobile) return;

    const onTouch = (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        // Only use touches on the right half of the screen
        if (t.clientX > window.innerWidth / 2) {
          inputRef.current.look = {
            x: (t.clientX / window.innerWidth) * 2 - 1,
            y: -((t.clientY / window.innerHeight) * 2 - 1),
          };
          break;
        }
      }
    };

    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => window.removeEventListener("touchmove", onTouch);
  }, [isMobile]);

  return { inputRef, onJoystickMove };
}
