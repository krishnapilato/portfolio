import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

// --- DICTIONARY (EN / IT) ---
const TRANSLATIONS = {
  en: {
    name: "KHOVA KRISHNA PILATO",
    role: "FULL-STACK JAVA DEVELOPER",
    title1: "COMING",
    title2: "SOON",
    hintDesktop: "STEER LIGHT (MOUSE / ARROWS)",
    hintMobile: "STEER LIGHT (TOUCH / SWIPE)",
    sensors: "GYRO SENSORS",
  },
  it: {
    name: "KHOVA KRISHNA PILATO",
    role: "SVILUPPATORE JAVA FULL-STACK",
    title1: "IN",
    title2: "ARRIVO",
    hintDesktop: "MUOVI LA LUCE (MOUSE / FRECCE)",
    hintMobile: "MUOVI LA LUCE (TOCCO / SCORRI)",
    sensors: "SENSORI GYRO",
  },
};

// --- 3D SCENE: THE DARK GYROSCOPE ---
const PrecisionGyroscope = ({ gyroEnabled }) => {
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

  // Responsive scaling for 3D object
  const isMobile = viewport.width < 5;
  const targetScale = isMobile ? 0.6 : 1;

  useEffect(() => {
    // 1. Mouse & Touch Controls
    const handleMove = (x, y) => {
      target.current.x = (x / window.innerWidth) * 2 - 1;
      target.current.y = -(y / window.innerHeight) * 2 + (isMobile ? 0 : 0);
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0)
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    // 2. Keyboard Arrows
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

    // 3. HARDWARE GYROSCOPE (Phone Tilt)
    const onDeviceOrientation = (e) => {
      if (!gyroEnabled || e.beta === null || e.gamma === null) return;
      let x = e.gamma / 30;
      let y = (e.beta - 45) / 30;
      target.current.x = Math.max(-1.5, Math.min(1.5, x));
      target.current.y = Math.max(-1.5, Math.min(1.5, -y));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    if (gyroEnabled)
      window.addEventListener("deviceorientation", onDeviceOrientation);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
    };
  }, [gyroEnabled, isMobile]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    // Loading Entrance Animation for Scale & Unfolding
    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 2, delta);
    
    // Calculates a 0 to 1 value for the initial unfolding animation
    const unfoldProgress = Math.min(t * 0.6, 1);
    const easeUnfold = 1 - Math.pow(1 - unfoldProgress, 4); // Quartic ease out

    // 1. Dynamic Camera Parallax for massive depth
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, target.current.x * 2, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, target.current.y * 2, 2, delta);
    state.camera.lookAt(0, 0, 0);

    // 2. Moving Point Light
    if (lightRef.current) {
      const lightX = THREE.MathUtils.lerp(lightRef.current.position.x, target.current.x * 15, delta * 3);
      const lightY = THREE.MathUtils.lerp(lightRef.current.position.y, target.current.y * 15, delta * 3);
      lightRef.current.position.set(lightX, lightY, 6);
    }

    // 3. Deep Mechanical Ring Rotations (Unfold + Continuous + Sine Wave Oscillation)
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.8 * easeUnfold;
      ring1.current.rotation.z = Math.sin(t * 1.5) * 0.2 * easeUnfold;
    }
    if (ring2.current) {
      ring2.current.rotation.y = (t * 0.4 + Math.PI / 4) * easeUnfold;
      ring2.current.rotation.x = Math.cos(t * 0.8) * 0.4 * easeUnfold;
    }
    if (ring3.current) {
      ring3.current.rotation.z = (t * 0.2 + Math.PI / 2) * easeUnfold;
      ring3.current.rotation.y = Math.sin(t * 0.5) * 0.3 * easeUnfold;
    }
    
    // Center sphere subtle float
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.1;
      sphereRef.current.rotation.x = t * 0.05;
    }

    // 4. Group inertia rotation
    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, target.current.x * 0.5, 3, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -target.current.y * 0.5, 3, delta);
    }
  });

  // Upgraded physical material for deep, clearcoat reflections
  const deepMetal = new THREE.MeshPhysicalMaterial({
    color: "#020202",
    metalness: 1,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2.0,
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={150} distance={30} color="#ffffff" />
      <ambientLight intensity={0.2} />
      <spotLight position={[-10, 10, -10]} intensity={2} angle={0.3} penumbra={1} color="#ffaa55" />
      <spotLight position={[10, -10, -10]} intensity={2} angle={0.3} penumbra={1} color="#55aaff" />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={groupRef}>
          <mesh ref={sphereRef} material={deepMetal}>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>
          <mesh ref={ring1} material={deepMetal}>
            <torusGeometry args={[1.4, 0.02, 64, 128]} />
          </mesh>
          <mesh ref={ring2} material={deepMetal}>
            <torusGeometry args={[1.8, 0.02, 64, 128]} />
          </mesh>
          <mesh ref={ring3} material={deepMetal}>
            <torusGeometry args={[2.2, 0.02, 64, 128]} />
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
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const t = TRANSLATIONS[lang];

  // Bulletproof Responsive Layout Detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const requestGyroPermission = async () => {
    if (gyroEnabled) {
      setGyroEnabled(false);
      return;
    }

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      alert("Gyroscope requires HTTPS connection.");
      return;
    }

    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setGyroEnabled(true);
        } else {
          alert("Permission denied. You can still use Touch controls!");
        }
      } catch (error) {
        console.error(error);
        alert(
          "Gyroscope blocked by Chrome iOS. Please use Safari or Touch controls!",
        );
      }
    } else {
      setGyroEnabled(true);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh", // Changed from 100vh to 100dvh to fix mobile bottom bar issue
        position: "relative",
        background: "#020202",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: "hidden",
        color: "#ffffff",
        touchAction: "none",
      }}
    >
      {/* 3D CANVAS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 35 }}>
          <PrecisionGyroscope gyroEnabled={gyroEnabled} />
        </Canvas>
      </motion.div>

      {/* UI OVERLAY */}
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
          // Extra bottom padding for mobile to clear iOS home bar + browser UI buffers
          paddingBottom: isMobile ? "max(45px, env(safe-area-inset-bottom, 45px))" : "40px",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER (Top Section) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Left: Name & Role */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <h1
              style={{
                fontSize: "clamp(0.65rem, 3vw, 0.85rem)",
                fontWeight: 600,
                letterSpacing: "0.15em",
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              {t.name}
            </h1>
            <p
              style={{
                fontSize: "clamp(0.5rem, 2vw, 0.65rem)",
                color: "#888",
                letterSpacing: "0.1em",
                marginTop: "6px",
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              {t.role}
            </p>
          </motion.div>

          {/* Right: Language Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
            style={{
              display: "flex",
              gap: "15px",
              pointerEvents: "auto",
              fontSize: "0.7rem",
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
              key={lang}
              initial={{ opacity: 0, filter: "blur(20px)", scale: 0.8, letterSpacing: "-0.1em" }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1, letterSpacing: "-0.04em" }}
              exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              style={{
                fontSize: "clamp(3rem, 14vw, 9rem)",
                fontWeight: 800,
                margin: 0,
                lineHeight: 0.85,
                color: "#ffffff",
              }}
            >
              {t.title1}
              <br />
              {t.title2}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* FOOTER (Bottom Section) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          style={{
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-end",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Actions (Sensors & Hint) */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                color: "#666",
              }}
            >
              {isMobile ? t.hintMobile : t.hintDesktop}
            </span>

            {/* Gyro Toggle Button (Only on Mobile) */}
            {isMobile && (
              <button
                onClick={requestGyroPermission}
                style={{
                  pointerEvents: "auto",
                  background: "transparent",
                  border: "1px solid",
                  borderColor: gyroEnabled ? "#4ADE80" : "#555",
                  color: gyroEnabled ? "#4ADE80" : "#555",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                {t.sensors}: {gyroEnabled ? "ON" : "OFF"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}