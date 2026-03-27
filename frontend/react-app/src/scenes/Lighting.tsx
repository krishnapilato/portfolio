export default function Lighting() {
  return (
    <>
      {/* Hemisphere: deep indigo sky / near-black ground */}
      <hemisphereLight color="#0d0d3a" groundColor="#020208" intensity={0.6} />

      {/* Very dark ambient fill */}
      <ambientLight color="#05050f" intensity={0.5} />

      {/* NW corner: electric blue */}
      <pointLight position={[-13, 4, -13]} color="#0055ff" intensity={6} distance={28} decay={2} />
      {/* NE corner: cyan */}
      <pointLight position={[13, 4, -13]} color="#00ffee" intensity={5} distance={28} decay={2} />
      {/* SW corner: magenta */}
      <pointLight position={[-13, 4, 13]} color="#ff00cc" intensity={5} distance={28} decay={2} />
      {/* SE corner: deep violet */}
      <pointLight position={[13, 4, 13]} color="#8800ff" intensity={4} distance={28} decay={2} />

      {/* Desk spotlight — sharp cyan cone pointing at workstation */}
      <spotLight
        position={[0, 5.2, -8]}
        target-position={[0, 0, -8]}
        color="#00ffff"
        intensity={12}
        distance={14}
        angle={0.35}
        penumbra={0.6}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Subtle amber accent above desk — warmth for the workspace */}
      <pointLight position={[0, 2.5, -7]} color="#ff8800" intensity={1.2} distance={5} decay={2} />

      {/* Floor-level neon strip lights — east & west */}
      <pointLight position={[-14, 0.3, 0]} color="#0044ff" intensity={3} distance={20} decay={2} />
      <pointLight position={[14, 0.3, 0]} color="#0044ff" intensity={3} distance={20} decay={2} />

      {/* Soft bounce from below center */}
      <pointLight position={[0, 0.4, 0]} color="#001133" intensity={2.5} distance={22} decay={2} />
    </>
  );
}
