export default function Lighting() {
  return (
    <>
      {/* Very dark ambient */}
      <ambientLight color="#050510" intensity={0.8} />

      {/* Neon corner point lights */}
      {/* North-West: Blue */}
      <pointLight
        position={[-13, 4, -13]}
        color="#0044ff"
        intensity={5}
        distance={25}
        decay={2}
      />
      {/* North-East: Cyan */}
      <pointLight
        position={[13, 4, -13]}
        color="#00ffff"
        intensity={4}
        distance={25}
        decay={2}
      />
      {/* South-West: Magenta */}
      <pointLight
        position={[-13, 4, 13]}
        color="#ff00ff"
        intensity={4}
        distance={25}
        decay={2}
      />
      {/* South-East: Purple */}
      <pointLight
        position={[13, 4, 13]}
        color="#aa00ff"
        intensity={3}
        distance={25}
        decay={2}
      />

      {/* Desk spotlight — cyan, pointing down */}
      <spotLight
        position={[0, 5, -8]}
        target-position={[0, 0, -8]}
        color="#00ffff"
        intensity={8}
        distance={12}
        angle={0.4}
        penumbra={0.5}
        decay={2}
        castShadow
      />

      {/* Soft fill from below — faint blue */}
      <pointLight
        position={[0, 0.5, 0]}
        color="#001133"
        intensity={2}
        distance={20}
        decay={2}
      />
    </>
  );
}
