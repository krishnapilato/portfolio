import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { AgXToneMapping, PCFShadowMap } from "three";
import { shallow } from "zustand/shallow";
import { DPR_RANGE } from "../lib/device";
import { useTimeline, type Tier } from "../lib/store";
import Post from "./Post";

type Props = { children: ReactNode };

/**
 * Compiles every program before the first frame is drawn, in parallel
 * where the driver allows (KHR_parallel_shader_compile), with the loop
 * held so no frame can stall on a link. Then the first drawn frame flags
 * the scene ready and the DOM lifts its curtain honestly. Priority 0 for
 * the frame probe on purpose: a positive priority would tell
 * react-three-fiber that this subscriber renders the scene itself, and on
 * the level without a post stack nothing would ever be drawn.
 */
function Compile() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const compiled = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setFrameloop("never");
    gl
      .compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        compiled.current = true;
        setFrameloop(useTimeline.getState().hidden ? "never" : "demand");
        invalidate();
      });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera, setFrameloop, invalidate]);

  useFrame(() => {
    const t = useTimeline.getState();
    if (compiled.current && !t.ready) t.set({ ready: true });
  });
  return null;
}

const LOWER: Record<Tier, Tier | null> = { high: "mid", mid: "low", low: null };

/**
 * The frame-time governor. Frames are rendered on demand, so it measures
 * only consecutive frames (a gap is a pause, not a slow frame). When the
 * smoothed frame interval stays above ~24 ms for a stretch of frames the
 * pixel ratio steps down inside the tier's range, and when that is spent
 * the effects level drops a step (post stack, reflective bench, refracting
 * glass). It never steps back up: a film that settles is better than one
 * that flickers between two looks.
 */
function Governor() {
  const setDpr = useThree((s) => s.setDpr);
  const tier = useTimeline((s) => s.tier);
  const [min, max] = DPR_RANGE[tier];
  const state = useRef({ ema: 16, run: 0, dpr: max, last: 0 });

  useFrame(() => {
    const s = state.current;
    const now = performance.now();
    const gap = now - s.last;
    s.last = now;
    if (gap > 120) {
      s.run = 0;
      return;
    }
    s.ema = s.ema * 0.9 + gap * 0.1;
    s.run++;
    if (s.run < 45 || s.ema <= 24) return;
    s.run = 0;
    s.ema = 16;
    if (s.dpr > min + 1e-3) {
      s.dpr = Math.max(min, s.dpr - 0.25);
      setDpr(s.dpr);
      return;
    }
    const t = useTimeline.getState();
    const next = LOWER[t.quality];
    if (next) t.set({ quality: next });
  });
  return null;
}

/** Pauses the loop while the tab is hidden and reports a lost context. */
function Lifecycle() {
  const gl = useThree((s) => s.gl);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const hidden = useTimeline((s) => s.hidden);
  const quality = useTimeline((s) => s.quality);

  // Render on demand: the rig, the instrument and the store ask for frames
  // while anything moves; an idle page draws nothing, a hidden tab less.
  useEffect(() => {
    setFrameloop(hidden ? "never" : "demand");
  }, [hidden, setFrameloop]);

  useEffect(() => {
    return useTimeline.subscribe((s) => s.progress, () => invalidate());
  }, [invalidate]);

  // The pointer parallax is a camera move too: without a frame request the
  // parked camera would ignore the mouse and lurch on the next scroll.
  useEffect(() => {
    return useTimeline.subscribe((s) => [s.pointerX, s.pointerY], () => invalidate(), { equalityFn: shallow });
  }, [invalidate]);

  // Without a post stack the renderer tone-maps; AgX keeps the metal silver.
  // The one shadow (the key spot's) exists only where the level pays for it.
  useEffect(() => {
    if (quality === "low") gl.toneMapping = AgXToneMapping;
    gl.shadowMap.enabled = quality !== "low";
    gl.shadowMap.type = PCFShadowMap;
    invalidate();
  }, [gl, quality, invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const set = useTimeline.getState().set;
    const lost = (event: Event) => {
      event.preventDefault();
      set({ contextLost: true });
    };
    const restored = () => {
      set({ contextLost: false });
      invalidate();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl, invalidate]);
  return null;
}

/**
 * The stage. Tone mapping lives in the post stack (`flat`) where there is
 * one; antialiasing is SMAA in post rather than MSAA on the framebuffer
 * (cheaper with an effect chain), and MSAA where there is no chain, since
 * it is nearly free on the tile GPUs the low tier runs on. The canvas is
 * opaque because nothing sits behind it.
 */
export default function Experience({ children }: Props) {
  const tier = useTimeline((s) => s.tier);
  const quality = useTimeline((s) => s.quality);
  return (
    <Canvas
      className="stage"
      role="presentation"
      aria-hidden="true"
      flat={quality !== "low"}
      frameloop="demand"
      dpr={DPR_RANGE[tier]}
      gl={{
        antialias: tier === "low",
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 32, near: 0.05, far: 80, position: [0, 1.2, 7] }}
      eventPrefix="client"
      onCreated={({ gl }) => {
        // The refracting glass renders the scene again: half size is plenty for a smudged pane.
        gl.transmissionResolutionScale = 0.5;
        if (tier === "low") gl.toneMapping = AgXToneMapping;
      }}
    >
      <Lifecycle />
      <Governor />
      <Suspense fallback={null}>
        {children}
        <Compile />
      </Suspense>
      {quality !== "low" ? <Post quality={quality} /> : null}
    </Canvas>
  );
}

