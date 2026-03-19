import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import './App.css';

// --- DICTIONARY (EN / IT) ---
const TRANSLATIONS = {
  en: {
    name: "KHOVA KRISHNA",
    lastName: "PILATO",
    role: "FULL-STACK JAVA ARCHITECT",
    status: "SYSTEMS ACTIVE",
    title1: "WORK IN",
    title2: "PROGRESS",
    connect: "INITIATE HANDSHAKE",
    hintDesktop: "STEER LIGHT (MOUSE / ARROWS)",
    hintMobile: "STEER LIGHT (TOUCH / SWIPE)",
    sensors: "GYRO SENSORS"
  },
  it: {
    name: "KHOVA KRISHNA",
    lastName: "PILATO",
    role: "ARCHITETTO JAVA FULL-STACK",
    status: "SISTEMI ATTIVI",
    title1: "LAVORI IN",
    title2: "CORSO",
    connect: "AVVIA CONNESSIONE",
    hintDesktop: "MUOVI LA LUCE (MOUSE / FRECCE)",
    hintMobile: "MUOVI LA LUCE (TOCCO / SCORRI)",
    sensors: "SENSORI GYRO"
  }
};

// --- 3D SCENE: THE DARK GYROSCOPE ---
const PrecisionGyroscope = ({ gyroEnabled }) => {
  const groupRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  
  const { viewport } = useThree();
  const target = useRef(new THREE.Vector2(0, 0));
  const lightRef = useRef();
  const timeRef = useRef(0);

  // Responsive scaling for 3D object
  const isMobile = viewport.width < 5;
  const scale = isMobile ? 0.6 : 1;

  useEffect(() => {
    // 1. Mouse & Touch Controls (Always active as fallback)
    const handleMove = (x, y) => {
      // If gyro is actively working, we reduce touch interference, but don't disable it completely
      target.current.x = (x / window.innerWidth) * 2 - 1;
      target.current.y = -(y / window.innerHeight) * 2 + (isMobile ? 0 : 0); 
    };
    
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    // 2. Keyboard Arrows
    const onKeyDown = (e) => {
      const speed = 0.2;
      if (e.key === 'ArrowRight') target.current.x = Math.min(target.current.x + speed, 1);
      if (e.key === 'ArrowLeft') target.current.x = Math.max(target.current.x - speed, -1);
      if (e.key === 'ArrowUp') target.current.y = Math.min(target.current.y + speed, 1);
      if (e.key === 'ArrowDown') target.current.y = Math.max(target.current.y - speed, -1);
    };

    // 3. HARDWARE GYROSCOPE (Phone Tilt)
    const onDeviceOrientation = (e) => {
      if (!gyroEnabled || e.beta === null || e.gamma === null) return;
      let x = e.gamma / 30; 
      let y = (e.beta - 45) / 30; 
      target.current.x = Math.max(-1.5, Math.min(1.5, x));
      target.current.y = Math.max(-1.5, Math.min(1.5, -y)); 
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    if (gyroEnabled) window.addEventListener('deviceorientation', onDeviceOrientation);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, [gyroEnabled, isMobile]);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;

    if (lightRef.current) {
      const lightX = THREE.MathUtils.lerp(lightRef.current.position.x, target.current.x * 12, delta * 4);
      const lightY = THREE.MathUtils.lerp(lightRef.current.position.y, target.current.y * 12, delta * 4);
      lightRef.current.position.set(lightX, lightY, 5);
    }

    if (ring1.current) ring1.current.rotation.x = time * 0.2;
    if (ring2.current) ring2.current.rotation.y = time * 0.3;
    if (ring3.current) ring3.current.rotation.z = time * 0.1;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, target.current.x * 0.6, delta * 3);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -target.current.y * 0.6, delta * 3);
    }
  });

  const darkMetal = new THREE.MeshStandardMaterial({ color: '#050505', metalness: 1, roughness: 0.15 });

  return (
    <>
      <pointLight ref={lightRef} intensity={100} distance={25} color="#ffffff" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 5, -5]} intensity={1} color="#FFe6cc" />
      <directionalLight position={[5, -5, -5]} intensity={1} color="#cce6ff" />

      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <group ref={groupRef} scale={scale}>
          <mesh material={darkMetal}><sphereGeometry args={[1, 64, 64]} /></mesh>
          <mesh ref={ring1} material={darkMetal}><torusGeometry args={[1.4, 0.015, 32, 100]} /></mesh>
          <mesh ref={ring2} material={darkMetal}><torusGeometry args={[1.8, 0.015, 32, 100]} /></mesh>
          <mesh ref={ring3} material={darkMetal}><torusGeometry args={[2.2, 0.015, 32, 100]} /></mesh>
        </group>
      </Float>
      <Environment preset="studio" />
    </>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [lang, setLang] = useState('en');
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const[isMobile, setIsMobile] = useState(false);
  const t = TRANSLATIONS[lang];

  // Bulletproof Responsive Layout Detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  },[]);

  const requestGyroPermission = async () => {
    if (gyroEnabled) {
      setGyroEnabled(false);
      return;
    }
    
    // Safety check for HTTP/Localhost vs HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert("Gyroscope requires HTTPS connection.");
      return;
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setGyroEnabled(true);
        } else {
          alert("Permission denied. You can still use Touch controls!");
        }
      } catch (error) {
        console.error(error);
        alert("Gyroscope blocked by Chrome iOS. Please use Safari or Touch controls!");
      }
    } else {
      // Android / Older browsers
      setGyroEnabled(true);
    }
  };

  return (
    <div style={{ 
      width: '100%', height: '100vh', position: 'relative', 
      background: '#020202', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden', color: '#ffffff', touchAction: 'none'
    }}>
      
      {/* 3D CANVAS */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
        <Canvas dpr={[1, 2]} camera={{ position:[0, 0, 7], fov: 45 }}>
          <PrecisionGyroscope gyroEnabled={gyroEnabled} />
        </Canvas>
      </div>

      {/* UI OVERLAY */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        zIndex: 1, pointerEvents: 'none', display: 'flex', flexDirection: 'column', 
        justifyContent: 'space-between', padding: isMobile ? '25px' : '40px', boxSizing: 'border-box' 
      }}>
        
        {/* HEADER (Top Section) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          {/* Left: Name & Role */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <h1 style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 600, letterSpacing: '0.15em', margin: 0 }}>
              {t.name} <br/> {t.lastName}
            </h1>
            <p style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', color: '#888', letterSpacing: '0.1em', marginTop: '8px', margin: 0 }}>
              {t.role}
            </p>
          </motion.div>
          
          {/* Right: Language Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: '15px', pointerEvents: 'auto', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em' }}>
            <span onClick={() => setLang('en')} style={{ cursor: 'pointer', color: lang === 'en' ? '#fff' : '#555', transition: 'color 0.3s' }}>EN</span>
            <span onClick={() => setLang('it')} style={{ cursor: 'pointer', color: lang === 'it' ? '#fff' : '#555', transition: 'color 0.3s' }}>IT</span>
          </motion.div>

        </div>

        {/* CENTER TITLE */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center', mixBlendMode: 'difference' }}>
          <AnimatePresence mode="wait">
            <motion.h2 
              key={lang}
              initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.8 }}
              style={{ fontSize: 'clamp(3rem, 14vw, 9rem)', fontWeight: 800, margin: 0, lineHeight: 0.85, letterSpacing: '-0.04em', color: '#ffffff' }}
            >
              {t.title1}<br/>{t.title2}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* FOOTER (Bottom Section) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column-reverse' : 'row', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'center' : 'flex-end', 
          gap: isMobile ? '25px' : '0' 
        }}>
          
          {/* Left: Status Indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase' }}>{t.status}</span>
          </motion.div>

          {/* Right: Actions (Sensors & Button) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', gap: '15px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: '#666' }}>
                {isMobile ? t.hintMobile : t.hintDesktop}
              </span>
              
              {/* Gyro Toggle Button (Only on Mobile) */}
              {isMobile && (
                <button onClick={requestGyroPermission} style={{
                  pointerEvents: 'auto', background: 'transparent', 
                  border: '1px solid', borderColor: gyroEnabled ? '#4ADE80' : '#555',
                  color: gyroEnabled ? '#4ADE80' : '#555', borderRadius: '20px', 
                  padding: '4px 10px', fontSize: '0.55rem', letterSpacing: '0.1em',
                  cursor: 'pointer', transition: 'all 0.3s'
                }}>
                  {t.sensors}: {gyroEnabled ? 'ON' : 'OFF'}
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, background: '#ffffff', color: '#000000' }} whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://www.linkedin.com/in/khovakrishnapilato/', '_blank')}
              style={{ 
                width: isMobile ? '100%' : 'auto', // Full width button on mobile
                padding: isMobile ? '14px 0' : '12px 28px', 
                background: 'transparent', color: '#ffffff', 
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '40px', 
                fontSize: '0.7rem', letterSpacing: '0.15em', cursor: 'pointer', 
                pointerEvents: 'auto', transition: 'background 0.3s, color 0.3s' 
              }}
            >
              {t.connect}
            </motion.button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}