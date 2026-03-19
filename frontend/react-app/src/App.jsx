import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  MeshTransmissionMaterial,
  Trail,
  Float,
  Lightformer,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import "./App.css";

// --- 1. RESPONSIVE GAME CONTROLLER (Mouse, Touch, Arrows) ---
const InteractiveFlightSpark = () => {
  const sparkRef = useRef();
  const lightRef = useRef();
  const { viewport } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    // Desktop Mouse
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      target.current.set(
        mouseX * (viewport.width / 2),
        mouseY * (viewport.height / 2),
        -2,
      );
    };

    // Mobile / Tablet Touch
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        target.current.set(
          mouseX * (viewport.width / 2.2),
          mouseY * (viewport.height / 2.2),
          -2,
        );
      }
    };

    // Keyboard Arrows
    const handleKeyDown = (e) => {
      const speed = viewport.width * 0.05; // Responsive speed
      if (e.key === "ArrowRight") target.current.x += speed;
      if (e.key === "ArrowLeft") target.current.x -= speed;
      if (e.key === "ArrowUp") target.current.y += speed;
      if (e.key === "ArrowDown") target.current.y -= speed;

      // Keep strictly within screen bounds
      target.current.x = THREE.MathUtils.clamp(
        target.current.x,
        -viewport.width / 2,
        viewport.width / 2,
      );
      target.current.y = THREE.MathUtils.clamp(
        target.current.y,
        -viewport.height / 2,
        viewport.height / 2,
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewport]);

  useFrame((state, delta) => {
    if (!sparkRef.current) return;

    // Smooth aerodynamic tracking
    sparkRef.current.position.lerp(target.current, delta * 5);

    // Dynamic Z-depth: It loops deep behind the glass, then flies in front
    sparkRef.current.position.z = Math.sin(state.clock.elapsedTime * 2) * 3;

    lightRef.current.position.copy(sparkRef.current.position);
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={60} distance={15} color="#FF9933" />
      <Trail
        width={viewport.width < 5 ? 0.2 : 0.5}
        length={viewport.width < 5 ? 4 : 8}
        color="#FF9933"
        attenuation={(t) => t * t}
      >
        <mesh ref={sparkRef}>
          <sphereGeometry args={[viewport.width < 5 ? 0.05 : 0.08, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </Trail>
    </>
  );
};

// --- 2. RESPONSIVE MORPHING GLASS ---
const LiquidGlassMonolith = () => {
  const meshRef = useRef();
  const { viewport } = useThree();

  // Intelligent 3D scaling based on device width
  const isMobile = viewport.width < 5;
  const responsiveScale = isMobile ? viewport.width * 0.25 : 1;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={responsiveScale}>
        <torusKnotGeometry args={[1.5, 0.6, 256, 64]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={2}
          thickness={1.5}
          roughness={0.05}
          transmission={1}
          ior={1.33}
          chromaticAberration={0.2}
          anisotropy={0.5}
          color="#e0f2fe"
        />
      </mesh>
    </Float>
  );
};

// --- MAIN APP ---
function App() {
  const [terminalLines, setTerminalLines] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive Layout Hook
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const bootSequence = [
    "> INITIALIZING JVM CONTEXT...",
    "> BOOTSTRAPPING SPRING BOOT 4.1 KERNEL...",
    "> ESTABLISHING SECURE HIKARICP POOL TO POSTGRESQL...",
    "> VALIDATING JWT ENCLAVE & ROTATING CRYPTO KEYS...",
    "> HYDRATING COMPONENT TREE & RESOLVING ASYNC CHUNKS...",
    "> MOUNTING DOCKER CONTAINER VOLUMES...",
    "> ALL SYSTEMS NOMINAL. AWAITING CONNECTION_",
  ];

  useEffect(() => {
    let timeouts = [];
    let delay = 0;
    bootSequence.forEach((line) => {
      delay += Math.random() * 500 + 1000;
      const timeout = setTimeout(() => {
        setTerminalLines((prev) => [...prev, line]);
      }, delay);
      timeouts.push(timeout);
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#030303",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        touchAction: "none", // CRITICAL: Prevents mobile pull-to-refresh so swipe controls work perfectly
      }}
    >
      {/* --- THE DEEP 3D CANVAS --- */}
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
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.2} />
          {/* Subtle background ambient lights */}
          <pointLight
            position={[-10, 10, -10]}
            intensity={10}
            color="#0284c7"
          />
          <pointLight
            position={[10, -10, -10]}
            intensity={10}
            color="#15803d"
          />

          <LiquidGlassMonolith />
          <InteractiveFlightSpark />

          <Environment resolution={256}>
            <Lightformer
              form="rect"
              intensity={2}
              position={[5, 5, -5]}
              scale={[10, 10, 1]}
              target={[0, 0, 0]}
            />
            <Lightformer
              form="rect"
              intensity={2}
              position={[-5, -5, -5]}
              scale={[10, 10, 1]}
              target={[0, 0, 0]}
            />
          </Environment>
        </Canvas>
      </div>

      {/* --- RESPONSIVE HUD (UI) --- */}
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
          padding: isMobile ? "25px" : "40px",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "15px" : "0",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              style={{
                fontSize: isMobile ? "1rem" : "1.2rem",
                fontWeight: 600,
                margin: 0,
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              KHOVA KRISHNA PILATO
            </h1>
            <p
              style={{
                fontSize: isMobile ? "0.7rem" : "0.8rem",
                color: "#888",
                margin: "4px 0 0 0",
                letterSpacing: "0.1em",
              }}
            >
              FULL STACK JAVA DEVELOPER &middot; ITALY
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isMobile ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                color: "#fff",
                letterSpacing: "0.2em",
                opacity: 0.6,
              }}
            >
              SYSTEMS ACTIVE
            </div>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#4ADE80",
                boxShadow: "0 0 10px #4ADE80",
              }}
            />
          </motion.div>
        </div>

        {/* Center: Awwwards Typography */}
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
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{
              fontSize: "clamp(2.5rem, 12vw, 8rem)",
              fontWeight: 800,
              margin: 0,
              color: "#ffffff",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            WORK IN
            <br />
            PROGRESS
          </motion.h2>
        </div>

        {/* Bottom Section: Dynamic Layout */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "flex-end",
            gap: "20px",
          }}
        >
          {/* Action Button & Hints */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
              gap: "15px",
              order: isMobile ? 1 : 2,
            }}
          >
            <div
              style={{
                fontSize: "0.6rem",
                color: "#666",
                letterSpacing: "0.2em",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              STEER THE SPARK <br />{" "}
              {isMobile ? "(SWIPE SCREEN)" : "(MOUSE / ARROWS)"}
            </div>
            <motion.button
              whileHover={{ scale: 1.03, background: "#fff", color: "#000" }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/khovakrishnapilato/",
                  "_blank",
                )
              }
              style={{
                padding: isMobile ? "16px 0" : "14px 28px",
                width: isMobile ? "100%" : "auto",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "30px",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                cursor: "pointer",
                pointerEvents: "auto",
                backdropFilter: "blur(10px)",
              }}
            >
              CONNECT
            </motion.button>
          </div>

          {/* Faux Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{
              fontFamily: "monospace",
              fontSize: isMobile ? "0.65rem" : "0.75rem",
              color: "#a3e635",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              order: isMobile ? 2 : 1,
              textAlign: isMobile ? "center" : "left",
              opacity: isMobile ? 0.7 : 1, // Slightly fade terminal on mobile to avoid noise
            }}
          >
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {line}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{
                width: "6px",
                height: "12px",
                background: "#a3e635",
                margin: isMobile ? "0 auto" : "0",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
