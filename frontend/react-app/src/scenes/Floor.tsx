import { Grid } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Floor() {
  return (
    <>
      {/* Physics floor */}
      <RigidBody type="fixed" name="floor">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#050510" transparent opacity={0.0} />
        </mesh>
      </RigidBody>

      {/* Reflective base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#03030a"
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Neon grid overlay */}
      <Grid
        position={[0, 0.002, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#00ffff"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#ff00ff"
        fadeDistance={40}
        fadeStrength={1.5}
        infiniteGrid={false}
        args={[30, 30]}
      />
    </>
  );
}
