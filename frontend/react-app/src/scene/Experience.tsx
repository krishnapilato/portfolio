import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Preload } from "@react-three/drei";
import { Suspense, useEffect, type ReactNode } from "react";
import { AgXToneMapping, MathUtils } from "three";
import { DPR_RANGE } from "../lib/device";
import { useTimeline } from "../lib/store";
import Post from "./Post";

type Props = { children: ReactNode };

/**
 * Flags the first frame so the DOM can lift its curtain honestly. Priority
 * 0 on purpose: a positive priority would tell react-three-fiber that this
 * subscriber renders the scene itself, and on the tier without a post
 * stack nothing would ever be drawn.
 */
function Ready() {
  useFrame(() => {
    const t = useTimeline.getState();
    if (!t.ready) t.set({ ready: true });
  });
  return null;
}

/** Moves the pixel ratio inside the tier's range as the frame rate allows. */
function Adaptive() {
  const setDpr = useThree((s) => s.setDpr);
  const tier = useTimeline((s) => s.tier);
  const [min, max] = DPR_RANGE[tier];
  return (
    <PerformanceMonitor
      ms={300}
      iterations={8}
      flipflops={3}
      onChange={({ factor }) => setDpr(MathUtils.lerp(min, max, factor))}
      onFallback={() => setDpr(min)}
    />
  );
}

/** Pauses the loop while the tab is hidden and survives a lost context. */
function Lifecycle() {
  const gl = useThree((s) => s.gl);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const hidden = useTimeline((s) => s.hidden);

  // Render on demand: the rig, the instrument and the store ask for frames
  // while anything moves; an idle page draws nothing, a hidden tab less.
  useEffect(() => {
    setFrameloop(hidden ? "never" : "demand");
  }, [hidden, setFrameloop]);

  useEffect(() => {
    return useTimeline.subscribe((s) => s.progress, () => invalidate());
  }, [invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const set = useTimeline.getState().set;
    const lost = (event: Event) => {
      event.preventDefault();
      set({ contextLost: true });
    };
    const restored = () => set({ contextLost: false });
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl]);
  return null;
}

/**
 * The stage. Tone mapping lives in the post stack (`flat`), antialiasing is
 * SMAA in post rather than MSAA on the framebuffer (cheaper with an effect
 * chain), and the canvas is opaque because nothing sits behind it.
 */
export default function Experience({ children }: Props) {
  const tier = useTimeline((s) => s.tier);
  return (
    <Canvas
      className="stage"
      role="presentation"
      aria-hidden="true"
      flat={tier !== "low"}
      frameloop="demand"
      dpr={DPR_RANGE[tier]}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 32, near: 0.05, far: 80, position: [0, 1.2, 7] }}
      eventPrefix="client"
      onCreated={({ gl }) => {
        // Without a post stack the renderer tone-maps; AgX keeps the metal silver.
        if (tier === "low") gl.toneMapping = AgXToneMapping;
      }}
    >
      <Lifecycle />
      <Adaptive />
      <Suspense fallback={null}>
        {children}
        <Preload all />
      </Suspense>
      {tier !== "low" ? <Post tier={tier} /> : null}
      <Ready />
    </Canvas>
  );
}
