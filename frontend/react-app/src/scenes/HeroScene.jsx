import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { EASE_APPLE } from "../lib/motionVariants.js";
import { useMousePosition } from "../hooks/useMousePosition.js";

// ─── Glass Gyroscope (hero centrepiece) ─────────────────────────────────────

function GlassGyroscope({ isMobile, mousePos }) {
  const groupRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const sphereRef = useRef();
  const lightRef = useRef();
  const timeRef = useRef(0);
  const scaleRef = useRef(0);
  const targetScale = isMobile ? 0.55 : 0.85;

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, targetScale, 2, delta);
    const unfold = 1 - Math.pow(1 - Math.min(t * 0.5, 1), 4);

    const mx = mousePos.current.nx;
    const my = mousePos.current.ny;

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, mx * 1.4, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, my * 1.4, 2, delta);
    state.camera.lookAt(0, 0, 0);

    if (lightRef.current) {
      lightRef.current.position.set(
        THREE.MathUtils.lerp(lightRef.current.position.x, mx * 10, delta * 4),
        THREE.MathUtils.lerp(lightRef.current.position.y, my * 10, delta * 4),
        5,
      );
    }

    if (ring1.current) {
      ring1.current.rotation.x = t * 0.4 * unfold;
      ring1.current.rotation.z = Math.sin(t) * 0.15 * unfold;
    }
    if (ring2.current) {
      ring2.current.rotation.y = (t * 0.2 + Math.PI / 4) * unfold;
      ring2.current.rotation.x = Math.cos(t * 0.5) * 0.2 * unfold;
    }
    if (ring3.current) {
      ring3.current.rotation.z = (t * 0.1 + Math.PI / 2) * unfold;
      ring3.current.rotation.y = Math.sin(t * 0.3) * 0.15 * unfold;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.05;
      sphereRef.current.rotation.x = t * 0.02;
    }
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, mx * 0.3, 2, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -my * 0.3, 2, delta);
    }
  });

  const glass = {
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
      <ambientLight intensity={0.8} />
      <spotLight position={[-10, 10, -10]} intensity={3} angle={0.4} penumbra={1} color="#ffffff" />
      <spotLight position={[10, -10, -10]} intensity={1.5} angle={0.4} penumbra={1} color="#e0f2fe" />

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
        <group ref={groupRef}>
          <mesh ref={sphereRef}>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshTransmissionMaterial {...glass} thickness={2} ior={1.6} />
          </mesh>
          <mesh ref={ring1}>
            <torusGeometry args={[1.45, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glass} />
          </mesh>
          <mesh ref={ring2}>
            <torusGeometry args={[1.85, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glass} />
          </mesh>
          <mesh ref={ring3}>
            <torusGeometry args={[2.25, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glass} />
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
}

// ─── HeroScene: full viewport canvas ─────────────────────────────────────────

export default function HeroScene({ isMobile }) {
  const mousePos = useMousePosition();

  // Touch support
  useEffect(() => {
    const onTouch = (e) => {
      if (e.touches.length > 0) {
        mousePos.current.nx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mousePos.current.ny = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
      }
    };
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => window.removeEventListener("touchmove", onTouch);
  }, [mousePos]);

  return (
    <motion.div
      className="absolute inset-0 z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, ease: EASE_APPLE }}
    >
      <Canvas dpr={[1, isMobile ? 1.5 : 2]} camera={{ position: [0, 0, 9], fov: 35 }}>
        <Suspense fallback={null}>
          <GlassGyroscope isMobile={isMobile} mousePos={mousePos} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
