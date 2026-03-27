import { Grid, MeshReflectorMaterial } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Floor() {
  return (
    <>
      {/* Physics floor — invisible collider */}
      <RigidBody type="fixed" name="floor">
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Mirror-finish reflective base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={512}
          mirror={0.65}
          mixBlur={8}
          mixStrength={1.2}
          color="#03030c"
          metalness={0.9}
          roughness={0.12}
        />
      </mesh>

      {/* Neon grid overlay — sits just above floor */}
      <Grid
        position={[0, 0.003, 0]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#00ddee"
        sectionSize={5}
        sectionThickness={1.0}
        sectionColor="#cc00ff"
        fadeDistance={35}
        fadeStrength={1.2}
        infiniteGrid={false}
        args={[30, 30]}
      />
    </>
  );
}
