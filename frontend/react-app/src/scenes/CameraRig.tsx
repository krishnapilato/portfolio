import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import useGameStore from '../store';

export default function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 3.5, 9));
  const targetLook = useRef(new THREE.Vector3(0, 1, 2));

  useFrame(() => {
    const playerPos = useGameStore.getState().playerPos;
    const playerRot = useGameStore.getState().playerRot;

    // Camera offset in local space, then rotate by player yaw
    const offset = new THREE.Vector3(0, 3.5, 7);
    offset.applyEuler(new THREE.Euler(0, playerRot, 0));

    const desired = new THREE.Vector3(
      playerPos[0] + offset.x,
      playerPos[1] + offset.y,
      playerPos[2] + offset.z,
    );

    const lookAt = new THREE.Vector3(
      playerPos[0],
      playerPos[1] + 1,
      playerPos[2],
    );

    targetPos.current.lerp(desired, 0.06);
    targetLook.current.lerp(lookAt, 0.08);

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);
  });

  return null;
}
