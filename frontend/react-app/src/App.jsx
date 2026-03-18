import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial, Float, Stars, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import './App.css';

const AviationGlobe = () => {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={groupRef}>
        <Sphere args={[2.2, 32, 32]}>
          <MeshDistortMaterial
            color="#ffffff"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            metalness={1}
            roughness={0}
            distort={0.1}
            speed={1.5}
            wireframe={true}
            transparent
            opacity={0.15}
          />
        </Sphere>
        <Sphere args={[1.5, 64, 64]}>
          <meshStandardMaterial 
            color="#050505" 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={2}
          />
        </Sphere>
      </group>
    </Float>
  );
};

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflow: 'hidden' }}>
      
      {/* Fixed 3D Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Canvas shadows camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={0.2} />
          
          {/* Subtle lighting matching India (Saffron) & Italy (Red) + Shared Green */}
          <pointLight position={[-5, 5, 0]} intensity={2} color="#FF9933" />
          <pointLight position={[5, -5, 0]} intensity={2} color="#CE2B37" />
          <pointLight position={[0, -5, 5]} intensity={1.5} color="#138808" />
          
          <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={1.5} />
          <AviationGlobe />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Absolute Centered Foreground Content */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Zones Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '30px',
              fontSize: '0.85rem',
              letterSpacing: '0.25em',
              color: '#ffffff',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <span>INDIA</span>
            <span style={{ fontSize: '1.2rem', color: '#888' }}>✈</span>
            <span>ITALY</span>
          </motion.div>
          
          <motion.h1 
            style={{ 
              fontSize: 'clamp(3rem, 8vw, 6.5rem)', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              margin: 0,
              color: '#fff',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #ffffff 0%, #666666 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            WORK IN<br />PROGRESS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5 }}
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: '#888',
              marginTop: '1.5rem',
              maxWidth: '500px',
              margin: '2rem auto 0 auto'
            }}
          >
            Full-Stack Java Developer
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          style={{ 
            position: 'absolute', 
            bottom: '10vh',
            pointerEvents: 'auto' 
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '14px 36px',
              background: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '30px',
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
            onClick={() => window.open('https://www.linkedin.com/in/khovakrishnapilato/', '_blank')}
          >
            CONNECT
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
