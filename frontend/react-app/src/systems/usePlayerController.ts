import { useEffect, useRef } from 'react';

export function usePlayerController() {
  const keysRef = useRef<Set<string>>(new Set());
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    lastKeyTimeRef.current = Date.now();
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      lastKeyTimeRef.current = Date.now();
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const getState = () => {
    const keys = keysRef.current;
    let vx = 0;
    let vz = 0;

    if (keys.has('KeyW') || keys.has('ArrowUp')) vz = -1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) vz = 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) vx = -1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) vx = 1;

    // Normalize diagonal movement
    if (vx !== 0 && vz !== 0) {
      vx *= 0.7071;
      vz *= 0.7071;
    }

    const isMoving = vx !== 0 || vz !== 0;
    const direction = isMoving ? Math.atan2(vx, vz) : 0;
    const velocity: [number, number, number] = [vx, 0, vz];

    return { velocity, isMoving, direction };
  };

  return { getState, lastKeyTimeRef };
}
