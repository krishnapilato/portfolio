/**
 * Airplane.jsx — Player-controlled vehicle with physics.
 *
 * A stylized low-poly paper airplane that the user drives around
 * the 3D world using WASD/arrows or mobile joystick.
 *
 * The camera follows in third-person (like Bruno Simon's car).
 * When near a zone marker, the store's activeZone updates.
 */

import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef, memo, useEffect } from "react";
import * as THREE from "three";
import { useAppStore } from "../store/index.js";

// ── Movement config ─────────────────────────────────────────
const SPEED = 14;
const TURN_SPEED = 3.2;
const CAMERA_OFFSET = new THREE.Vector3(0, 8, 14);
const CAMERA_LOOK_AHEAD = new THREE.Vector3(0, 1, -8);

// Temp vectors (reused each frame — no allocation)
const _forward = new THREE.Vector3();
const _impulse = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camLook = new THREE.Vector3();
const _playerPos = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

function Airplane({ isMobile }) {
  const bodyRef = useRef(null);
  const meshRef = useRef(null);
  const rotationY = useRef(0);
  const keysRef = useRef(new Set());
  const joystickRef = useRef({ x: 0, y: 0 });

  const setPlayerPosition = useAppStore((s) => s.setPlayerPosition);
  const cinematicActive = useAppStore((s) => s.cinematicActive);

  // ── Keyboard input ──────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const down = (e) => keysRef.current.add(e.key.toLowerCase());
    const up = (e) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [isMobile]);

  // ── Listen for joystick input from VirtualJoystick ──────
  useEffect(() => {
    const handler = (e) => {
      joystickRef.current = e.detail;
    };
    window.addEventListener("joystick-move", handler);
    return () => window.removeEventListener("joystick-move", handler);
  }, []);

  // ── Per-frame physics + camera ──────────────────────────
  useFrame((state, delta) => {
    if (!bodyRef.current || cinematicActive) return;

    const body = bodyRef.current;
    const dt = Math.min(delta, 0.05); // clamp for tab-out

    // Read input
    const keys = keysRef.current;
    let moveZ = 0, turnX = 0;

    if (isMobile) {
      moveZ = -joystickRef.current.y; // forward/back
      turnX = -joystickRef.current.x; // left/right
    } else {
      if (keys.has("w") || keys.has("arrowup")) moveZ = -1;
      if (keys.has("s") || keys.has("arrowdown")) moveZ = 1;
      if (keys.has("a") || keys.has("arrowleft")) turnX = 1;
      if (keys.has("d") || keys.has("arrowright")) turnX = -1;
    }

    // Rotation
    if (Math.abs(moveZ) > 0.01) {
      rotationY.current += turnX * TURN_SPEED * dt;
    }

    // Forward vector
    _forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);

    // Apply impulse
    const currentVel = body.linvel();
    _impulse.copy(_forward).multiplyScalar(moveZ * SPEED);
    _impulse.y = currentVel.y; // preserve gravity

    // Damping
    if (Math.abs(moveZ) < 0.01) {
      _impulse.x = currentVel.x * 0.92;
      _impulse.z = currentVel.z * 0.92;
      _impulse.y = currentVel.y;
    }

    body.setLinvel({ x: _impulse.x, y: _impulse.y, z: _impulse.z }, true);

    // Rotate the body
    _euler.set(0, rotationY.current, 0);
    _quat.setFromEuler(_euler);
    body.setRotation({ x: _quat.x, y: _quat.y, z: _quat.z, w: _quat.w }, true);

    // Update mesh tilt (banking on turn)
    if (meshRef.current) {
      const bankAngle = turnX * moveZ * 0.25;
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        bankAngle,
        dt * 5,
      );
    }

    // Player position → store (for zone detection)
    const pos = body.translation();
    _playerPos.set(pos.x, pos.y, pos.z);
    setPlayerPosition(_playerPos.x, _playerPos.y, _playerPos.z);

    // ── Third-person camera ───────────────────────────────
    _camTarget
      .copy(CAMERA_OFFSET)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current)
      .add(_playerPos);

    _camLook
      .copy(CAMERA_LOOK_AHEAD)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current)
      .add(_playerPos);

    state.camera.position.lerp(_camTarget, dt * 3.5);
    state.camera.lookAt(_camLook);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={[0, 2, 0]}
      type="dynamic"
      mass={1}
      friction={0.8}
      restitution={0.1}
      lockRotations
      linearDamping={0.5}
      enabledRotations={[false, false, false]}
    >
      <group ref={meshRef}>
        {/* Fuselage */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.4, 2.4]} />
          <meshStandardMaterial
            color="#8b8bf5"
            emissive="#6366f1"
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        {/* Wings */}
        <mesh castShadow position={[0, 0.35, -0.3]}>
          <boxGeometry args={[3.2, 0.06, 0.9]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#6366f1"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Tail wing */}
        <mesh castShadow position={[0, 0.35, 1.1]}>
          <boxGeometry args={[1.2, 0.05, 0.4]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#6366f1"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Tail fin */}
        <mesh castShadow position={[0, 0.65, 1.0]}>
          <boxGeometry args={[0.06, 0.6, 0.6]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#6366f1"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Nose cone */}
        <mesh castShadow position={[0, 0.3, -1.3]}>
          <coneGeometry args={[0.28, 0.6, 4]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>

        {/* Engine glow */}
        <mesh position={[0, 0.3, 1.35]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.8} />
        </mesh>

        {/* Navigation lights */}
        <mesh position={[-1.6, 0.38, -0.3]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[1.6, 0.38, -0.3]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
    </RigidBody>
  );
}

export default memo(Airplane);
