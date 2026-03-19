import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import "./App.css";

// --- DICTIONARY (EN / IT) ---
const TRANSLATIONS = {
  en: {
    name: "KHOVA KRISHNA PILATO",
    role: "FULL-STACK JAVA DEVELOPER",
    status: "SYSTEMS BOOTING",
    title1: "COMING",
    title2: "SOON",
    connect: "INITIATE HANDSHAKE",
    hint: "STEER LIGHT (MOUSE/ARROWS)",
  },
  it: {
    name: "KHOVA KRISHNA PILATO",
    role: "SVILUPPATORE JAVA FULL-STACK",
    status: "AVVIO SISTEMI",
    title1: "IN",
    title2: "ARRIVO",
    connect: "AVVIA CONNESSIONE",
    hint: "MUOVI LA LUCE (MOUSE/FRECCE)",
  },
};

// --- 3D SCENE: THE DARK GYROSCOPE ---
const PrecisionGyroscope = () => {
  const groupRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  const { viewport } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));
  const lightRef = useRef();

  // 1. ADD THIS: We create our own time tracker
  const timeRef = useRef(0);

  // Responsive scaling
  const scale = viewport.width < 5 ? 0.6 : 1;

  useEffect(() => {
    const handleMove = (x, y) => {
      target.current.x = (x / window.innerWidth) * 2 - 1;
      target.current.y = -(y / window.innerHeight) * 2 + 1;
    };
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0)
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onKeyDown = (e) => {
      const speed = 0.2;
      if (e.key === "ArrowRight")
        target.current.x = Math.min(target.current.x + speed, 1);
      if (e.key === "ArrowLeft")
        target.current.x = Math.max(target.current.x - speed, -1);
      if (e.key === "ArrowUp")
        target.current.y = Math.min(target.current.y + speed, 1);
      if (e.key === "ArrowDown")
        target.current.y = Math.max(target.current.y - speed, -1);
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
    // 2. USE THIS: Accumulate time manually using the frame delta
    timeRef.current += delta;
    const time = timeRef.current;

    if (lightRef.current) {
      const lightX = THREE.MathUtils.lerp(
        lightRef.current.position.x,
        target.current.x * 10,
        delta * 3,
      );
      const lightY = THREE.MathUtils.lerp(
        lightRef.current.position.y,
        target.current.y * 10,
        delta * 3,
      );
      lightRef.current.position.set(lightX, lightY, 5);
    }

    // 3. USE OUR CUSTOM TIME FOR ROTATIONS
    if (ring1.current) ring1.current.rotation.x = time * 0.2;
    if (ring2.current) ring2.current.rotation.y = time * 0.3;
    if (ring3.current) ring3.current.rotation.z = time * 0.1;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        target.current.x * 0.5,
        delta * 2,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -target.current.y * 0.5,
        delta * 2,
      );
    }
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: "#050505",
    metalness: 1,
    roughness: 0.15,
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={80} distance={20} color="#ffffff" />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={1.5}
        color="#FFe6cc"
      />
      <directionalLight
        position={[5, -5, -5]}
        intensity={1.5}
        color="#cce6ff"
      />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={groupRef} scale={scale}>
          <mesh material={darkMetal}>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>
          <mesh ref={ring1} material={darkMetal}>
            <torusGeometry args={[1.4, 0.02, 32, 100]} />
          </mesh>
          <mesh ref={ring2} material={darkMetal}>
            <torusGeometry args={[1.8, 0.02, 32, 100]} />
          </mesh>
          <mesh ref={ring3} material={darkMetal}>
            <torusGeometry args={[2.2, 0.02, 32, 100]} />
          </mesh>
        </group>
      </Float>
      <Environment preset="studio" />
    </>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [lang, setLang] = useState("en");
  const t = TRANSLATIONS[lang];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#020202", // Pitch black
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: "hidden",
        color: "#ffffff",
      }}
    >
      {/* 3D CANVAS - Perfectly optimized */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 45 }}>
          <PrecisionGyroscope />
        </Canvas>
      </div>

      {/* FOREGROUND UI OVERLAY */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(20px, 4vw, 50px)",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                margin: 0,
              }}
            >
              {t.name}
            </h1>
            <p
              style={{
                fontSize: "0.65rem",
                color: "#888",
                letterSpacing: "0.1em",
                marginTop: "6px",
              }}
            >
              {t.role}
            </p>
          </motion.div>

          {/* LANGUAGE TOGGLE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: "flex",
              gap: "15px",
              pointerEvents: "auto",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
            }}
          >
            <span
              onClick={() => setLang("en")}
              style={{
                cursor: "pointer",
                color: lang === "en" ? "#fff" : "#555",
                transition: "color 0.3s",
              }}
            >
              EN
            </span>
            <span
              onClick={() => setLang("it")}
              style={{
                cursor: "pointer",
                color: lang === "it" ? "#fff" : "#555",
                transition: "color 0.3s",
              }}
            >
              IT
            </span>
          </motion.div>
        </div>

        {/* CENTER TITLE */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            textAlign: "center",
            mixBlendMode: "difference",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={lang} // Forces animation re-run when language changes
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                fontSize: "clamp(3rem, 12vw, 9rem)",
                fontWeight: 800,
                margin: 0,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                color: "#ffffff",
              }}
            >
              {t.title1}
              <br />
              {t.title2}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* STATUS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#fff",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "#888",
                textTransform: "uppercase",
              }}
            >
              {t.status}
            </span>
          </motion.div>

          {/* ACTION BUTTON */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "15px",
            }}
          >
            <span
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                color: "#666",
              }}
            >
              {t.hint}
            </span>
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "#ffffff",
                color: "#000000",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/khovakrishnapilato/",
                  "_blank",
                )
              }
              style={{
                padding: "12px 28px",
                background: "transparent",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "40px",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "background 0.3s, color 0.3s",
              }}
            >
              {t.connect}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Simple CSS animation injected for the pulsing dot */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
