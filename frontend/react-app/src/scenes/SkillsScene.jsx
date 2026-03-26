import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Suspense, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useAppStore } from "../store/index.js";
import { useMousePosition } from "../hooks/useMousePosition.js";

// ─── Category colours ────────────────────────────────────────────────────────
const CAT_COLORS = {
  backend:  "#6366f1",
  frontend: "#8b5cf6",
  data:     "#06b6d4",
  cloud:    "#10b981",
};

// ─── Single orbiting skill node ──────────────────────────────────────────────
function SkillNode({ skill, baseAngle, orbitRadius, speed, mousePos, onHover }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const timeRef = useRef(baseAngle);
  const [hovered, setHovered] = useState(false);
  const color = CAT_COLORS[skill.category] ?? "#6366f1";

  useFrame((state, delta) => {
    timeRef.current += delta * speed;
    const angle = timeRef.current;
    const mx = mousePos.current.nx * 0.6;
    const my = mousePos.current.ny * 0.4;

    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angle) * orbitRadius + mx;
      meshRef.current.position.y = Math.sin(angle * 0.7) * (orbitRadius * 0.35) + my;
      meshRef.current.position.z = Math.sin(angle) * (orbitRadius * 0.2);
      meshRef.current.rotation.y += delta * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.intensity = THREE.MathUtils.lerp(
        glowRef.current.intensity,
        hovered ? 3 : 0.6,
        delta * 6,
      );
    }
  });

  return (
    <group>
      <pointLight ref={glowRef} intensity={0.6} distance={3} color={color} />
      <mesh
        ref={meshRef}
        onPointerEnter={() => { setHovered(true); onHover(skill.id); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <octahedronGeometry args={[hovered ? 0.18 : 0.13, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
          roughness={0.1}
          metalness={0.8}
        />
        {hovered && (
          <Html distanceFactor={12} style={{ pointerEvents: "none" }}>
            <div className="px-3 py-1.5 rounded-lg border border-white/15 bg-black/80 backdrop-blur-xl whitespace-nowrap">
              <p className="text-[11px] font-medium text-white">{skill.name}</p>
              <p className="text-[9px] text-white/40 mt-0.5">{skill.level}%</p>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

// ─── Orbit ring ──────────────────────────────────────────────────────────────
function OrbitRing({ radius, color, tilt }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, tilt]}>
      <torusGeometry args={[radius, 0.004, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} />
    </mesh>
  );
}

// ─── Full scene ──────────────────────────────────────────────────────────────
function SkillsSceneInner({ skills, mousePos }) {
  const setActiveNode = useAppStore((s) => s.setActiveSkillNode);
  const timeRef = useRef(0);

  // Stable orbit tilt values (memoized so they never change between renders)
  const orbitTilts = useMemo(() => [0.2, 0.8, 1.4, 2.1], []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const mx = mousePos.current.nx;
    const my = mousePos.current.ny;

    // Slow automated camera drift + mouse parallax (via state.camera inside useFrame is fine)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mx * 1.5, delta * 1.2);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, my * 1.0 + Math.sin(t * 0.2) * 0.5, delta * 1.2);
    state.camera.lookAt(0, 0, 0);
  });

  // Flatten all skills into one array with orbit params
  const allSkills = skills.flatMap((group) => group.items);

  const orbits = [
    { radius: 2.0, color: "#6366f1", speed: 0.18 },
    { radius: 3.2, color: "#8b5cf6", speed: 0.12 },
    { radius: 4.4, color: "#06b6d4", speed: 0.09 },
    { radius: 5.5, color: "#10b981", speed: 0.07 },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={1} color="#6366f1" />

      {/* Central core */}
      <mesh>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} distance={4} color="#6366f1" />

      {orbits.map((orbit, oi) => (
        <OrbitRing key={orbit.radius} radius={orbit.radius} color={orbit.color} tilt={orbitTilts[oi]} />
      ))}

      {allSkills.map((skill, i) => {
        const orbitIndex = i % orbits.length;
        const orbit = orbits[orbitIndex];
        const baseAngle = (i / allSkills.length) * Math.PI * 2;
        return (
          <SkillNode
            key={skill.id}
            skill={skill}
            baseAngle={baseAngle}
            orbitRadius={orbit.radius}
            speed={orbit.speed}
            mousePos={mousePos}
            onHover={setActiveNode}
          />
        );
      })}
    </>
  );
}

// ─── Exported component ──────────────────────────────────────────────────────
export default function SkillsScene({ skills, isMobile }) {
  const mousePos = useMousePosition();

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SkillsSceneInner skills={skills} mousePos={mousePos} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
