/**
 * VirtualJoystick — touch-based joystick for mobile navigation.
 *
 * Renders a translucent circular pad in the bottom-left of the viewport.
 * Dragging the inner knob outputs normalised (x, y) values via onMove.
 * Released → snaps back to centre → onMove({ x: 0, y: 0 }).
 */

import { memo, useCallback, useRef } from "react";

const PAD_SIZE = 120;
const KNOB_SIZE = 44;
const MAX_DIST = (PAD_SIZE - KNOB_SIZE) / 2;

function VirtualJoystick({ onMove }) {
  const padRef = useRef(null);
  const knobRef = useRef(null);
  const activeRef = useRef(false);
  const originRef = useRef({ x: 0, y: 0 });

  const update = useCallback(
    (tx, ty) => {
      const dx = tx - originRef.current.x;
      const dy = ty - originRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, MAX_DIST);
      const angle = Math.atan2(dy, dx);
      const cx = Math.cos(angle) * clamped;
      const cy = Math.sin(angle) * clamped;

      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${cx}px, ${cy}px)`;
      }

      onMove?.({
        x: cx / MAX_DIST,
        y: -cy / MAX_DIST, // invert screen-space Y so forward (up on screen) = positive in world
      });
    },
    [onMove],
  );

  const reset = useCallback(() => {
    activeRef.current = false;
    if (knobRef.current) {
      knobRef.current.style.transform = "translate(0px, 0px)";
    }
    onMove?.({ x: 0, y: 0 });
  }, [onMove]);

  const onTouchStart = useCallback(
    (e) => {
      e.preventDefault();
      const rect = padRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      originRef.current = { x: cx, y: cy };
      activeRef.current = true;
      const t = e.touches[0];
      update(t.clientX, t.clientY);
    },
    [update],
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!activeRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      update(t.clientX, t.clientY);
    },
    [update],
  );

  return (
    <div
      className="fixed z-[200] pointer-events-auto"
      style={{ bottom: 32, left: 24 }}
    >
      <div
        ref={padRef}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: PAD_SIZE,
          height: PAD_SIZE,
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
          backdropFilter: "blur(2px)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={reset}
        onTouchCancel={reset}
      >
        <div
          ref={knobRef}
          className="rounded-full"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            background: "rgba(99,102,241,0.35)",
            border: "1.5px solid rgba(99,102,241,0.5)",
            transition: "transform 0.08s ease-out",
          }}
        />
      </div>
    </div>
  );
}

export default memo(VirtualJoystick);
