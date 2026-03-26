import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

// --- CUSTOM EASING (Apple-like fluid spring) ---
const easeApple = [0.16, 1, 0.3, 1];

// --- 3D SCENE: LIQUID GLASS GYROSCOPE ---
const LiquidGlassGyroscope = () => {
  const groupRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const sphereRef = useRef();

  const { viewport } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));
  const lightRef = useRef();
  const timeRef = useRef(0);
  const currentScale = useRef(0);

  const isMobile = viewport.width < 5;
  const targetScale = isMobile ? 0.65 : 1.1;

  useEffect(() => {
    const handleMove = (x, y) => {
      target.current.x = (x / window.innerWidth) * 2 - 1;
      target.current.y = -(y / window.innerHeight) * 2;
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0)
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onKeyDown = (e) => {
      const speed = 0.2;
      if (e.key === "ArrowRight") target.current.x = Math.min(target.current.x + speed, 1);
      if (e.key === "ArrowLeft") target.current.x = Math.max(target.current.x - speed, -1);
      if (e.key === "ArrowUp") target.current.y = Math.min(target.current.y + speed, 1);
      if (e.key === "ArrowDown") target.current.y = Math.max(target.current.y - speed, -1);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 2, delta);
    const unfoldProgress = Math.min(t * 0.5, 1);
    const easeUnfold = 1 - Math.pow(1 - unfoldProgress, 4); 

    // Smooth subtle camera drift
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, target.current.x * 1.5, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, target.current.y * 1.5, 2, delta);
    state.camera.lookAt(0, 0, 0);

    // Follow light creating dynamic edge highlights
    if (lightRef.current) {
      const lightX = THREE.MathUtils.lerp(lightRef.current.position.x, target.current.x * 10, delta * 4);
      const lightY = THREE.MathUtils.lerp(lightRef.current.position.y, target.current.y * 10, delta * 4);
      lightRef.current.position.set(lightX, lightY, 5);
    }

    // Majestic, slow, weighty rotation
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.4 * easeUnfold;
      ring1.current.rotation.z = Math.sin(t * 1.0) * 0.15 * easeUnfold;
    }
    if (ring2.current) {
      ring2.current.rotation.y = (t * 0.2 + Math.PI / 4) * easeUnfold;
      ring2.current.rotation.x = Math.cos(t * 0.5) * 0.2 * easeUnfold;
    }
    if (ring3.current) {
      ring3.current.rotation.z = (t * 0.1 + Math.PI / 2) * easeUnfold;
      ring3.current.rotation.y = Math.sin(t * 0.3) * 0.15 * easeUnfold;
    }
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.05;
      sphereRef.current.rotation.x = t * 0.02;
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, target.current.x * 0.3, 2, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -target.current.y * 0.3, 2, delta);
    }
  });

  // Liquid Glass Material Props
  const glassMaterialProps = {
    transmission: 1,
    thickness: 1.5,
    roughness: 0.05,
    ior: 1.4,
    chromaticAberration: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    color: "#ffffff",
    resolution: isMobile ? 512 : 1024,
  };

  return (
    <>
      <pointLight ref={lightRef} intensity={80} distance={20} color="#ffffff" />
      <ambientLight intensity={0.8} color="#ffffff" />
      <spotLight position={[-10, 10, -10]} intensity={3} angle={0.4} penumbra={1} color="#ffffff" />
      <spotLight position={[10, -10, -10]} intensity={1.5} angle={0.4} penumbra={1} color="#e0f2fe" />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <group ref={groupRef}>
          <mesh ref={sphereRef}>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshTransmissionMaterial {...glassMaterialProps} thickness={2} ior={1.6} />
          </mesh>
          <mesh ref={ring1}>
            <torusGeometry args={[1.45, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glassMaterialProps} />
          </mesh>
          <mesh ref={ring2}>
            <torusGeometry args={[1.85, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glassMaterialProps} />
          </mesh>
          <mesh ref={ring3}>
            <torusGeometry args={[2.25, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glassMaterialProps} />
          </mesh>
        </group>
      </Float>

      <Environment resolution={isMobile ? 256 : 512}>
        <Lightformer form="rect" intensity={2} position={[0, 10, 0]} scale={[20, 2, 1]} target={[0, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-10, 0, -10]} scale={[2, 20, 1]} target={[0, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[10, 0, -10]} scale={[2, 20, 1]} target={[0, 0, 0]} color="#ffffff" />
        <Lightformer form="ring" intensity={1} position={[0, -5, -20]} scale={[10, 10, 1]} target={[0, 0, 0]} color="#ffffff" />
      </Environment>
    </>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  },[]);

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh", 
        position: "relative",
        background: "radial-gradient(circle at 50% 50%, #111114 0%, #050505 100%)",
        fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: "hidden",
        overscrollBehavior: "none", 
        color: "#ffffff",
        touchAction: "none",
      }}
    >
      {/* 3D CANVAS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: easeApple }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      >
        <Canvas dpr={[1, 2]} camera={{ position:[0, 0, 9], fov: 35 }}>
          <LiquidGlassGyroscope />
        </Canvas>
      </motion.div>

      {/* LUXURY UI OVERLAY */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none",
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end", // Pushes the inner elements to the bottom
          padding: isMobile ? "25px" : "40px",
          paddingBottom: isMobile ? "max(45px, env(safe-area-inset-bottom, 45px))" : "40px", // Adapts for iPhone swipe bar
          boxSizing: "border-box",
        }}
      >
        
        {/* CENTER TITLE & DATE (Still absolutely anchored to dead center) */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", textAlign: "center", mixBlendMode: "screen" }}>
          <motion.div
            initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.5, ease: easeApple }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <h2 style={{
              fontSize: "clamp(3.5rem, 15vw, 10rem)",
              margin: 0,
              lineHeight: 0.9,
              color: "#ffffff",
              display: "flex",
              flexDirection: "column"
            }}>
              <span style={{ fontWeight: 200, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)" }}>COMING</span>
              <span style={{ fontWeight: 600, letterSpacing: "-0.06em", color: "#ffffff" }}>SOON</span>
            </h2>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: easeApple }}
              style={{
                marginTop: "30px", fontSize: "clamp(0.7rem, 2vw, 0.9rem)", fontWeight: 300, letterSpacing: "0.5em", color: "#94a3b8",
              }}
            >
              06 · 05 · 2026
            </motion.div>
          </motion.div>
        </div>

        {/* FOOTER ANCHOR (PERFECTLY CENTERED AT BOTTOM) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} // Starts slightly below and slides up
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.5, delay: 0.2, ease: easeApple }}
          style={{ width: "100%", textAlign: "center" }}
        >
          <h1 style={{
            fontSize: "clamp(0.65rem, 3vw, 0.8rem)",
            fontWeight: 500,
            letterSpacing: "0.2em",
            margin: 0,
            color: "#e2e8f0"
          }}>
            KHOVA KRISHNA PILATO
          </h1>
          <p style={{
            fontSize: "clamp(0.5rem, 2vw, 0.6rem)",
            fontWeight: 300,
            color: "#64748b",
            letterSpacing: "0.15em",
            marginTop: "8px",
            margin: 0,
          }}>
            FULL-STACK JAVA DEVELOPER
          </p>
        </motion.div>

      </div>
    </div>
  );
}